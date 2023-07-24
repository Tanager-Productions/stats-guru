import { Injectable } from '@angular/core';
import { AccountDto } from 'src/app/interfaces/accountDto.interface';

export enum Credentials {
  Key = "statsGuruKey",
  Token = "statsGuruToken"
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public showPopover:boolean = false;

  storeCredential(key:Credentials, value:string) {
    localStorage.setItem(key, value);
  }

  getCredential(key:Credentials): string | null {
    return localStorage.getItem(key);
  }

  storeUser(user: AccountDto) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser(): AccountDto | null {
    const userJson = localStorage.getItem('user');
    return userJson !== null ? JSON.parse(userJson) : null;
  }

  removeUser() {
    localStorage.removeItem('user');
  }
}




