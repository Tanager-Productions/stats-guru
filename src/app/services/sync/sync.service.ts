import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { SqlService } from '../sql/sql.service';
import { ServerGame } from 'src/app/interfaces/server/game.server.interface';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private dbVersion:number = 1;

  constructor(private api:ApiService, private sqlService:SqlService) { }

  public async beginSync() {
    await this.fetchAndInsertGames();
  }

  private async fetchAndInsertGames() {
    let response = await this.api.getAllGames();
    if (response.status == 200) {
      let db = await this.sqlService.createConnection("tgs", false, "no-encryption", this.dbVersion);
      await db.open();
      for (let game of response.data as ServerGame[]) {
        let sqlcmd = this.getGameInsertString(game);
        await db.run(sqlcmd);
      }
      await db.close();
    } else {
      throw new Error(`Failed to fetch games from server: ${response.data}`);
    }
  }

  private getNullableString(value:boolean | string | null) {
    return value == null ? null : `\"${value}\"`
  }

  private getGameInsertString(game:ServerGame) {
    return `
      insert into games (
        gameId, homeTeam, awayTeam, gameDate,
        homePointsQ1, homePointsQ2, homePointsQ3, homePointsQ4,
        homePointsOT, awayPointsQ1, awayPointsQ2, awayPointsQ3,
        awayPointsQ4, awayPointsOT, isMale, complete,
        clock, homeTeamTOL, awayTeamTOL, has4Quarters,
        period, gameLink, added, modified
      ) values (
        ${game.gameId}, "${game.homeTeam}", "${game.awayTeam}", "${game.gameDate}",
        ${game.homePointsQ1}, ${game.homePointsQ2}, ${game.homePointsQ3}, ${game.homePointsQ4},
        ${game.homePointsOT}, ${game.awayPointsQ1}, ${game.awayPointsQ2}, ${game.awayPointsQ3},
        ${game.awayPointsQ4}, ${game.awayPointsOT}, ${this.getNullableString(game.isMale)}, "${game.complete}",
        "${game.clock}", ${game.homeTeamTOL}, ${game.awayTeamTOL}, ${this.getNullableString(game.has4Quarters)},
        ${this.getNullableString(game.period)}, ${this.getNullableString(game.gameLink)}, "false", "false"
      )
    `;
  }
}
