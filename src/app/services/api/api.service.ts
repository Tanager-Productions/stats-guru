import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpHeaders, HttpOptions, HttpResponse } from "@capacitor/core";
import { GamecastDto } from 'src/app/interfaces/gamecastDto.interface';
import { SyncDto } from 'src/app/interfaces/sync.interface';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  public serverUrl:string = environment.serverUrl;

  public getApiToken() {
    let userString = localStorage.getItem("user");
    if (userString == null) {
      return "";
    } else {
      let user = JSON.parse(userString);
      return user.token;
    }
  }

  public async postSync(sync:SyncDto) {
    let options: HttpOptions = {
      url: `${this.serverUrl}/StatsGuru/Sync`,
      data: sync,
      headers: {"X-ACCESS-TOKEN": this.getApiToken(), "Content-Type": "application/json"}
    };
    return await CapacitorHttp.post(options);
  }

  public async getData() {
    let options: HttpOptions = {
      url: `${this.serverUrl}/StatsGuru/GetData`,
      headers: {"X-ACCESS-TOKEN": this.getApiToken()}
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

	public async GenerateTicket() {
    let options: HttpOptions = {
      url: `${this.serverUrl}/WebSocket/GenerateTicket`,
      headers: {"X-ACCESS-TOKEN": this.getApiToken()}
    };
    return await CapacitorHttp.get(options);
  }

  public async GetUser(token:string) {
    let options: HttpOptions = {
      url: `${this.serverUrl}/StatsGuru/GetUser`,
      headers: {"X-ACCESS-TOKEN": token}
    };
    return await CapacitorHttp.get(options);
  }

	public async GameCast(dto: GamecastDto) {
    let options: HttpOptions = {
      url: `${this.serverUrl}/StatsGuru/GameCast`,
			data: dto,
      headers: {"X-ACCESS-TOKEN": this.getApiToken(), "Content-Type": "application/json"}
    };
    return await CapacitorHttp.post(options);
	}

	public async Debug() {
    let options: HttpOptions = {
      url: `${this.serverUrl}/Debug`
    };
    return await CapacitorHttp.get(options);
	}

}
