import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { TestPageComponent } from './test/test-page/test-page.component';

const routes: Routes = [
  {
    path: 'login',
    pathMatch: 'full',
    component: LoginComponent
  },
  {
    path: 'test',
    pathMatch: 'full',
    component: TestPageComponent
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'test'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }