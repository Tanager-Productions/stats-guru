import { Injectable } from '@angular/core';
import { JsonSQLite } from '@capacitor-community/sqlite';
import { CapacitorHttp, HttpHeaders, HttpOptions, HttpResponse } from "@capacitor/core";
import { Admin } from 'src/app/types/admin.type';
import { HttpClient } from '@angular/common/http';
import { Game } from 'src/app/interfaces/game.interface';
import { Logo } from 'src/app/types/logo.type';


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private serverUrl:string = "http://localhost:57812";
  //private serverUrl:string = "https://mobileapi.thegrindsession.com";

  constructor(private http: HttpClient) { }

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


  public verifyAdmin(accessToken:string, email?:string, name?:string) {
    return this.http.post<Admin>(this.serverUrl+"Admins/VerifyAdmin", {MicrosoftAccessToken: accessToken, Email: email, FullName: name}, {withCredentials: true});
  }

  public verifyToken() {
    return this.http.get(this.serverUrl+"Admins/VerifyToken", {withCredentials: true});
  }

  public logOut() {
    return this.http.get(`${this.serverUrl}Admins/LogOut`, {withCredentials:true});
  }

  public getAdmin() {
    return this.http.get<Admin>(`${this.serverUrl}Admins/GetAdmin`, {withCredentials: true});
  }

  public saveGame(gameToUpdate:Game) {
    return this.http.post(this.serverUrl+'Games/SaveGame', gameToUpdate, {withCredentials: true});
  }

  public getLogos() {
    return this.http.get<Logo[]>(`${this.serverUrl}Teams/GetLogos`);
  }

  
}
