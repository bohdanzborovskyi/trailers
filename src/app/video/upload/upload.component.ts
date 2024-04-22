import {Component, OnDestroy} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AngularFireStorage, AngularFireUploadTask} from "@angular/fire/compat/storage";
import {v4 as uuid} from "uuid";
import {last, switchMap} from "rxjs/operators";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import firebase from "firebase/compat/app";
import {ClipService} from "../../services/clip.service";
import {Router} from "@angular/router";
import {FfmpegService} from "../../services/ffmpeg.service";
import {combineLatest, forkJoin} from "rxjs";


@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnDestroy{

  isDragover = false
  file: File | null = null
  nextStep = false
  showAlert = false
  alertMsg = 'Please wait! Your video is being loaded.'
  alertColor = 'blue'
  inSubmission = false
  percentage = 0
  showPercentage = false
  user : firebase.User | null = null
  task? : AngularFireUploadTask
  screenshots:string[] = []
  selectedScreenshot = ''
  screenshotTask? : AngularFireUploadTask

  title = new FormControl("", [
    Validators.required,
    Validators.minLength(3)]);
  uploadForm = new FormGroup({
    title: this.title
  })

  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipService: ClipService,
    private router : Router,
    protected ffmpegService: FfmpegService) {
    auth.user.subscribe(user => {
      this.user = user;
      this.ffmpegService.init()
    })
  }


  async storeFile($event: Event) {
    if(this.ffmpegService.isRunning){
      return
    }
    this.isDragover = false
    this.file = ($event as DragEvent).dataTransfer ?
      ($event as DragEvent).dataTransfer?.files.item(0) ?? null :
      ($event.target as HTMLInputElement).files?.item(0) ?? null;
    if(!this.file || this.file.type !== 'video/mp4'){
      return
    }

    this.screenshots = await this.ffmpegService.getScreenshots(this.file)
    this.selectedScreenshot = this.screenshots[0]

    this.title.setValue(
      this.file.name.replace(/\.[^/.]+$/, '')
    )
    this.nextStep = true
  }

  async uploadFile(){
    this.uploadForm.disable()
    this.showAlert = true
    this.alertColor = 'blue'
    this.alertMsg = 'Please wait! Your video is being loaded.'
    this.inSubmission = true
    this.showPercentage = true
    const clipFileName = uuid()
    const clipPath = 'clips/' + clipFileName + '.mp4'
    const screenshotBlob = await this.ffmpegService.blobFromURL(this.selectedScreenshot)
    const screenshotPath = 'screenshots/' + clipFileName + '.png'
    this.task = this.storage.upload(clipPath, this.file)
    const clipRef = this.storage.ref(clipPath)
    this.screenshotTask = this.storage.upload(screenshotPath, screenshotBlob)
    const screenshoRef = this.storage.ref(screenshotPath)

    combineLatest([
      this.task.percentageChanges(),
      this.screenshotTask.percentageChanges()
    ]).subscribe(progress =>{
      const [clipProgress, screenshotProgress] = progress;
      if(!clipProgress || !screenshotProgress){
        return
      }
      const total = clipProgress + screenshotProgress;
      this.percentage = total as number / 200
    })

    forkJoin([
      this.task.snapshotChanges(),
      this.screenshotTask.snapshotChanges()
    ]).pipe(
      switchMap(()=> forkJoin([clipRef.getDownloadURL(), screenshoRef.getDownloadURL()]))
     ).subscribe({
      next: async (urls) =>{
        const [clipUrl, screenshotUrl] = urls;
        const clip = {
          uid : this.user?.uid as string,
          displayName: this.user?.email as string,
          title: this.title.value as string,
          fileName: clipFileName+'.mp4',
          url: clipUrl,
          screenshotUrl:screenshotUrl,
          timeStamp: firebase.firestore.FieldValue.serverTimestamp(),
          screenshotFilename: clipFileName + '.png',
        }
        const clipDocRef = await this.clipService.createClip(clip)

        this.alertColor = 'green'
        this.alertMsg = 'Upload successfully.'
        this.showPercentage = false

        setTimeout(()=>{
          this.router.navigate([
            'clip', clipDocRef.id
          ])
        }, 1000)
      },
      error: (error) =>{
        this.uploadForm.enable()
        this.alertColor = 'red'
        this.alertMsg = 'Error uploading file.'
        this.inSubmission = true
        this.showPercentage = false
        console.error(error)
      }
    })
  }

  ngOnDestroy(): void {
    this.task?.cancel()
  }
}
