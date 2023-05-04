import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { LoginPage } from './login.page';
import { LoginRoutingModule } from './login-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  declarations: [
    LoginPage
  ],
  imports: [
    CommonModule,
    IonicModule,
    LoginRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class LoginModule { }
