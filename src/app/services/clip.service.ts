import {Injectable} from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  DocumentReference
} from "@angular/fire/compat/firestore";
import {IClip} from "../models/clip.model";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {AngularFireStorage} from "@angular/fire/compat/storage";
import {ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot} from "@angular/router";
import {map} from "rxjs/operators";


@Injectable({
  providedIn: 'root'
})
export class ClipService implements Resolve<IClip | null>{

  public clipCollection: AngularFirestoreCollection<IClip>
  public pageClips: IClip[] = []
  pendingReq = false

  constructor(
    private db: AngularFirestore,
    private auth: AngularFireAuth,
    private storage: AngularFireStorage,
    private router: Router) {
    this.clipCollection = db.collection('clips')
  }

  createClip(data: IClip): Promise<DocumentReference<IClip>> {
    return this.clipCollection.add(data)
  }

  getUserClips(uid: string, sort: string) {
    return this.clipCollection.ref.where('uid', '==', uid).orderBy('timeStamp', sort === '1' ? 'desc' : 'asc').get()
  }

  updateClip(id: string, title: string) {
    return this.clipCollection.doc(id).update({title})
  }

  async deleteClip(clip: IClip) {
    const clipRef = this.storage.ref('clips/' + clip.fileName)
    const screenshotRef = this.storage.ref('screenshots/' + clip.screenshotFilename)
    await clipRef.delete()
    await screenshotRef.delete()
    await this.clipCollection.doc(clip.docID).delete()
  }

  async getClips() {
    if (this.pendingReq) {
      return
    }
    this.pendingReq = true
    let query = this.clipCollection.ref.orderBy(
      'timeStamp', 'desc'
    ).limit(6)
    const {length} = this.pageClips
    if (length) {
      let lastDoc;
      const lastDocID = this.pageClips[length - 1].docID
      await this.clipCollection.doc(lastDocID).get().toPromise().then(value => {
        lastDoc =  value.data()?.timeStamp
      })
      console.log(lastDoc)
      query = query.startAfter(lastDoc)
    }
    const snapshot = await query.get()
    snapshot.forEach(doc =>{
      this.pageClips.push({
        docID: doc.id,
        ...doc.data()
      })
    })
    this.pendingReq = false
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.clipCollection.doc(route.params.id).
    get().
    pipe(
      map(snapshot => {
         const data = snapshot.data();
         if(!data){
           this.router.navigate(['/'])
           return null
         }
         return data
      })
    )
  }
}

