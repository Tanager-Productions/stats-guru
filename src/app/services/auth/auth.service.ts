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

  async storeCredential(key:Credentials, account:string, value:string) {
    // @ts-ignore
    await window.StatsGuru.setPassword(key, account, value);
  }

  async getCredential(key:Credentials, account:string): Promise<string | null> {
    // @ts-ignore
    return await window.StatsGuru.getPassword(key, account);
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




