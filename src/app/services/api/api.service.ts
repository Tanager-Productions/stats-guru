import { Injectable } from '@angular/core';
import { JsonSQLite } from '@capacitor-community/sqlite';
import { CapacitorHttp, HttpHeaders, HttpOptions, HttpResponse } from "@capacitor/core";
import { Admin } from 'src/app/types/admin.type';
import { Game } from 'src/app/interfaces/game.interface';
import { Logo } from 'src/app/types/logo.type';


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private serverUrl:string = "http://localhost:57812";
  //private serverUrl:string = "https://mobileapi.thegrindsession.com";

  constructor() { }

  public async getApiToken() {
    let userString = localStorage.getItem("user");
    if (userString == null) {
      return "";
    } else {
      let user = JSON.parse(userString);
      return user.token;
    }
  }

  public async postSync(sync:JsonSQLite) {
    let options: HttpOptions = {
      url: `${this.serverUrl}/StatsGuru/Sync`,
      data: sync,
      headers: {"X-ACCESS-TOKEN": await this.getApiToken()}
    };
    return await CapacitorHttp.post(options);
  }

  public async getAllGames() {
    let options: HttpOptions = {
      url: `${this.serverUrl}/Games`,
      headers: {"X-ACCESS-TOKEN": await this.getApiToken()}
    };
    return await CapacitorHttp.get(options);
  }

  public async getAllTeams(logos:boolean = false) {
    let options: HttpOptions = {
      url: `${this.serverUrl}/Teams`,
      params: {"logos": `${logos}`},
      headers: {"X-ACCESS-TOKEN": await this.getApiToken()}
    };
    return await CapacitorHttp.get(options);
  }

  public async getAllPlayers() {
    let options: HttpOptions = {
      url: `${this.serverUrl}/Players`,
      headers: {"X-ACCESS-TOKEN": await this.getApiToken()}
    };
    return await CapacitorHttp.get(options);
  }

  public async getAllStats() {
    let options: HttpOptions = {
      url: `${this.serverUrl}/Stats`,
      headers: {"X-ACCESS-TOKEN": await this.getApiToken()}
    };
    return await CapacitorHttp.get(options);
  }

  public async getAllPlays() {
    let options: HttpOptions = {
      url: `${this.serverUrl}/Stats/GetPlays`,
      params: {"gameId": "0"},
      headers: {"X-ACCESS-TOKEN": await this.getApiToken()}
    };
    return await CapacitorHttp.get(options);
  }

  public async VerifyApiKey(key:string, admin:string) {
    let options: HttpOptions = {
      url: `${this.serverUrl}/Admins/VerifyApiKey`,
      headers: {"API_KEY": key, "ADMIN_ID": admin}
    };
    return await CapacitorHttp.get(options);
  }

  public async GenerateToken(key:string, admin:string) {
    let options: HttpOptions = {
      url: `${this.serverUrl}/Admins/GenerateSgToken`,
      headers: {"API_KEY": key, "ADMIN_ID": admin}
    };
    return await CapacitorHttp.post(options);
  }

  public async GetUser(token:string) {
    let options: HttpOptions = {
      url: `${this.serverUrl}/StatsGuru/GetUser`,
      headers: {"X-ACCESS-TOKEN": token}
    };
    return await CapacitorHttp.get(options);
  }
}
