import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {ClipService} from "../../services/clip.service";
import {IClip} from "../../models/clip.model";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {ModalService} from "../../services/modal.service";
import {BehaviorSubject, combineLatest} from "rxjs";


@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css']
})
export class ManageComponent implements OnInit {

  videoOrder = '1'
  clips: IClip[] = []
  activeClip : IClip | null = null
  sort$: BehaviorSubject<string>

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clipService: ClipService,
    private auth: AngularFireAuth,
    private modal: ModalService) {
    this.sort$ = new BehaviorSubject<string>(this.videoOrder)
  }


  sort($event: Event) {
    const {value} = $event.target as HTMLSelectElement

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        sort: value
      }
    })
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.videoOrder = params['sort'] ? params['sort'] : '1';
      this.sort$.next(this.videoOrder)
    })
    combineLatest(
      this.auth.user,
      this.sort$
    ).subscribe(
      values => {
         const [user, sort] = values
         this.clipService.getUserClips(user?.uid as string, sort).then(snapshot => {
           this.clips = []
            snapshot.docs.forEach(doc => {
              this.clips.push({
                docID: doc.id,
                ...doc.data()})
            })
          }
        )
        console.log(this.clips)
      }
    )
  }

  openModal($event:Event, clip:IClip){
    $event.preventDefault()
    this.activeClip=clip
    this.modal.toggleModal('editClip')
  }

  update($event:IClip) {
    this.clips.forEach((element, index) =>{
      if(element.docID===$event.docID){
        this.clips[index].title = $event.title
      }
    })
  }

  deleteClip($event:Event, clip: IClip){
    $event.preventDefault()
    this.clipService.deleteClip(clip)
    this.clips.forEach((element, index) =>{
      if(element.docID == clip.docID){
        this.clips.splice(index,1)
      }
    })
  }

  async copyToClipboard($event: MouseEvent, docID: string | undefined) {
    $event.preventDefault()
    if(!docID){
      return
    }
    const url = `${location.origin}/clip/${docID}`;
    await navigator.clipboard.writeText(url);
    alert('Link copied!')
  }
}
