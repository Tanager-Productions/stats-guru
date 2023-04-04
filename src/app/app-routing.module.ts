import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TestPageComponent } from './test/test-page/test-page.component';

const routes: Routes = [
  {
    path: 'test',
    pathMatch: 'full',
    component: TestPageComponent
  },
  {
    pathMatch: 'full',
    path: '',
    redirectTo: 'test'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
