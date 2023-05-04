import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TestPageComponent } from './test/test-page/test-page.component';
import { LoginPage } from './pages/login/login.page';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginModule)
  },
  {
    path: 'test',
    pathMatch: 'full',
    component: TestPageComponent
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomeModule)
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
