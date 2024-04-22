import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {HomeComponent} from "./home/home.component";
import {AboutComponent} from "./about/about.component";
import {ClipComponent} from "./clip/clip.component";
import {NotFoundComponent} from "./not-found/not-found.component";
import {AngularFireAuthGuard, redirectUnauthorizedTo} from "@angular/fire/compat/auth-guard";
import {ClipService} from "./services/clip.service";

const redirectUnauthorizedToHome = () => redirectUnauthorizedTo('/')


const routes: Routes = [
  {
    path:'',
    component: HomeComponent
  },
  {
    path:'about',
    component: AboutComponent
  },
  {
    path:'clip/:id',
    component: ClipComponent,
    data:{
      authOnly: true,
      authGuardPipe: redirectUnauthorizedToHome
    },
    canActivate: [AngularFireAuthGuard],
    resolve: {
      clip: ClipService
    }
  },
  {
    path: '',
    loadChildren: async () => (await import('./video/video.module')).VideoModule
  },
  {
    path:'**',
    component: NotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {scrollPositionRestoration: 'enabled', anchorScrolling:'enabled'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
