import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpHeaders, HttpOptions, HttpResponse } from "@capacitor/core";
import { GamecastDto } from 'src/app/interfaces/gamecastDto.interface';
import { SyncDto } from 'src/app/interfaces/sync.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  public readonly serverUrl = environment.serverUrl;

  public getApiToken() {
    let userString = localStorage.getItem("user");
    if (userString == null) {
      return "";
    } else {
      let user = JSON.parse(userString);
      return user.token;
    }
  }

  public postSync(sync:SyncDto) {
    let options: HttpOptions = {
      url: `${this.serverUrl}/StatsGuru/Sync`,
      data: sync,
      headers: {"X-ACCESS-TOKEN": this.getApiToken(), "Content-Type": "application/json"}
    };
    return CapacitorHttp.post(options);
  }

	public postLog(log:FormData, admin:string) {
    let options: HttpOptions = {
      url: `${this.serverUrl}/Logs`,
      data: log,
      headers: {"X-ACCESS-TOKEN": this.getApiToken(), "Content-Type": "multipart/form-data", "ADMIN_ID": admin}
    };
    return CapacitorHttp.post(options);
  }

  public getData() {
    let options: HttpOptions = {
      url: `${this.serverUrl}/StatsGuru/GetData`,
      headers: {"X-ACCESS-TOKEN": this.getApiToken()}
    };
    return CapacitorHttp.get(options);
  }

  public verifyApiKey(key:string, admin:string) {
    let options: HttpOptions = {
      url: `${this.serverUrl}/Admins/VerifyApiKey`,
      headers: {"API_KEY": key, "ADMIN_ID": admin}
    };
    return CapacitorHttp.get(options);
  }

  public generateToken(key:string, admin:string) {
    let options: HttpOptions = {
      url: `${this.serverUrl}/Admins/GenerateSgToken`,
      headers: {"API_KEY": key, "ADMIN_ID": admin}
    };
    return CapacitorHttp.post(options);
  }

	public generateTicket() {
    let options: HttpOptions = {
      url: `${this.serverUrl}/WebSocket/GenerateTicket`,
      headers: {"X-ACCESS-TOKEN": this.getApiToken()}
    };
    return CapacitorHttp.get(options);
  }

  public getUser(token:string) {
    let options: HttpOptions = {
      url: `${this.serverUrl}/StatsGuru/GetUser`,
      headers: {"X-ACCESS-TOKEN": token}
    };
    return CapacitorHttp.get(options);
  }

	public gameCast(dto: GamecastDto) {
    let options: HttpOptions = {
      url: `${this.serverUrl}/StatsGuru/GameCast`,
			data: dto,
      headers: {"X-ACCESS-TOKEN": this.getApiToken(), "Content-Type": "application/json"}
    };
    return CapacitorHttp.post(options);
	}

	public debug() {
    let options: HttpOptions = {
      url: `${this.serverUrl}/Debug`
    };
    return CapacitorHttp.get(options);
	}

}
