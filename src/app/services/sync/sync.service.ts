import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { SqlService } from '../sql/sql.service';
import { ServerGame } from 'src/app/interfaces/server/game.server.interface';
import { CrudService } from '../crud/crud.service';
import { ServerPlayer } from 'src/app/interfaces/server/player.server.interface';
import { ServerTeam } from 'src/app/interfaces/server/team.server.interface';
import { ServerStat } from 'src/app/interfaces/server/stat.server.interface';
import { ServerPlay } from 'src/app/interfaces/server/play.server.interface';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  constructor(private api:ApiService, private sqlService:SqlService, private crudService:CrudService) { }

  public async beginSync() {
    try {
      let db = await this.sqlService.createConnection();
      await db.open();
      let res = await db.exportToJson('full');
      let httpResponse = await this.api.postSync(res.export!);
      console.log(httpResponse.status == 200);
      await db.close();
      //await this.fetchAndInsertTeams();
      //await this.fetchAndInsertPlayers();
      //await this.fetchAndInsertGames();
      //await this.fetchAndInsertStats();
      //await this.fetchAndInsertPlays();
    } catch (error) {
      console.log(error);
    }
  }

  private async fetchAndInsertGames() {
    let response = await this.api.getAllGames();
    if (response.status == 200) {
      let db = await this.sqlService.createConnection();
      await db.open();
      for (let game of response.data as ServerGame[]) {
        delete game.homeFinal;
        delete game.awayFinal;
        await this.crudService.save(db, "games", game);
      }
      await db.close();
    } else {
      throw new Error(`Failed to fetch games from server: ${response.data}`);
    }
  }

  private async fetchAndInsertPlayers() {
    let response = await this.api.getAllPlayers();
    if (response.status == 200) {
      let db = await this.sqlService.createConnection();
      await db.open();
      for (let player of response.data as ServerPlayer[]) {
        await this.crudService.save(db, "players", player);
      }
      await db.close();
    } else {
      throw new Error(`Failed to fetch games from server: ${response.data}`);
    }
  }

  private async fetchAndInsertTeams() {
    let response = await this.api.getAllTeams();
    if (response.status == 200) {
      let db = await this.sqlService.createConnection();
      await db.open();
      for (let team of response.data as ServerTeam[]) {
        await this.crudService.save(db, "teams", team);
      }
      await db.close();
    } else {
      throw new Error(`Failed to fetch games from server: ${response.data}`);
    }
  }

  private async fetchAndInsertStats() {
    let response = await this.api.getAllStats();
    if (response.status == 200) {
      let stats = response.data as ServerStat[];
      for (let stat of stats) {
        delete stat.points;
      }
      let db = await this.sqlService.createConnection();
      await db.open();
      for (var i = 0; i < stats.length; i = i + 50) {
        let end = i+50;
        if (end > stats.length) {
          end = stats.length-1;
        }
        await this.crudService.bulkInsert(db, "stats", stats.slice(i, end));
      }
      await db.close();
    } else {
      throw new Error(`Failed to fetch games from server: ${response.data}`);
    }
  }

  private async fetchAndInsertPlays() {
    let response = await this.api.getAllPlays();
    if (response.status == 200) {
      let db = await this.sqlService.createConnection();
      await db.open();
      let plays = response.data as ServerPlay[];
      for (var i = 0; i < plays.length; i = i + 100) {
        let end = i+100;
        if (end > plays.length) {
          end = plays.length-1;
        }
        await this.crudService.bulkInsert(db, "plays", plays.slice(i, end));
      }
      await db.close();
    } else {
      throw new Error(`Failed to fetch games from server: ${response.data}`);
    }
  }
}
