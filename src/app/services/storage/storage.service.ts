import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor() { }

  storeUser(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser(): any | null {
    const userJson = localStorage.getItem('user');
    return userJson !== null ? JSON.parse(userJson) : null;
  }

  removeUser() {
    localStorage.removeItem('user');
  }
}




