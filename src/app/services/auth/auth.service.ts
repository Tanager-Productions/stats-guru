import { Injectable } from '@angular/core';
import { UserDto } from 'src/app/interfaces/user-dto.interface';

export enum Credentials {
  Key = "statsGuruKey",
  Token = "statsGuruToken"
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor() { }

  async storeCredential(key:Credentials, account:string, value:string) {
    // @ts-ignore
    await window.StatsGuru.setPassword(key, account, value);
  }

  async getCredential(key:Credentials, account:string): Promise<string | null> {
    // @ts-ignore
    return await window.StatsGuru.getPassword(key, account);
  }

  storeUser(user: UserDto) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser(): UserDto | null {
    const userJson = localStorage.getItem('user');
    return userJson !== null ? JSON.parse(userJson) : null;
  }

  removeUser() {
    localStorage.removeItem('user');
  }
}




