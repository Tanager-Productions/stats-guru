import { Injectable } from '@angular/core';
import { SqlService } from '../sql/sql.service';
import { Game } from 'src/app/interfaces/game.interface';
import { Player } from 'src/app/interfaces/player.interface';
import { Play } from 'src/app/interfaces/play.interface';
import { Team } from 'src/app/interfaces/team.interface';
import { Stat } from 'src/app/interfaces/stat.interface';

@Injectable({
  providedIn: 'root'
})
export class TgsDatabaseService {
  private dbVersion:number = 1;

  constructor(private sqlite: SqlService) { }

  // #region Games
  public async getGames(gameId:number = 0): Promise<Game[]> {
    let db = await this.sqlite.createConnection('tgs', false, 'no-encryption', this.dbVersion);
    await db.open();
    let sqlcmd = "select * from games";
    if (gameId > 0) {
      sqlcmd += ` where gameId = ${gameId}`
    }
    let res = await db.query(sqlcmd);
    if (res.values == undefined || res.values?.length == 0) {
      throw new Error("Failed to fetch games");
    } else {
      await db.close();
      return res.values;
    }
  }

  public async saveGame(game:Game): Promise<void> {
    let db = await this.sqlite.createConnection('tgs', false, 'no-encryption', this.dbVersion);
    await db.open();
    let sqlcmd, values;
    if (game.gameId == 0) {
      sqlcmd = 'INSERT INTO games () VALUES (?,?,?)';
      values = ['Jackson', 'Jackson@example.com', 32];
    } else {
      sqlcmd = 'INSERT INTO games () VALUES (?,?,?)';
      values = ['Jackson', 'Jackson@example.com', 32];
    }
    let res = await db.run(sqlcmd, values);
    if (res.changes?.changes == 0) {
      throw new Error(`Failed to save game`);
    } else {
      await db.close();
    }
  }

  public async deleteGame(gameId:number): Promise<void> {
    let db = await this.sqlite.createConnection('tgs', false, 'no-encryption', this.dbVersion);
    await db.open();
    let res = await db.run(`delete from games where gameId = ${gameId}`);
    if (res.changes?.changes == 0) {
      throw new Error(`Failed to save game`);
    } else {
      await db.close();
    }
  }
  // #endregion

  // #region Players
  public async getPlayers(playerId:number = 0): Promise<Player[]> {
    let db = await this.sqlite.createConnection('tgs', false, 'no-encryption', this.dbVersion);
    await db.open();
    let sqlcmd = "select * from players";
    if (playerId > 0) {
      sqlcmd += ` where playerId = ${playerId}`
    }
    let res = await db.query(sqlcmd);
    if (res.values == undefined || res.values?.length == 0) {
      throw new Error("Failed to fetch players");
    } else {
      await db.close();
      return res.values;
    }
  }

  public async deletePlayer(playerId:number): Promise<void> {
    let db = await this.sqlite.createConnection('tgs', false, 'no-encryption', this.dbVersion);
    await db.open();
    let res = await db.run(`delete from players where playerId = ${playerId}`);
    if (res.changes?.changes == 0) {
      throw new Error(`Failed to save game`);
    } else {
      await db.close();
    }
  }

  public async savePlayer(player:Player): Promise<void> {

  }
  // #endregion

  // #region Teams
  public async getTeams(teamName?: string, isMale?:boolean): Promise<Team[]> {
    let db = await this.sqlite.createConnection('tgs', false, 'no-encryption', this.dbVersion);
    await db.open();
    let sqlcmd = "select * from teams";
    if (teamName && isMale) {
      sqlcmd += ` where teamName = ${teamName} AND isMale = ${isMale}`;
    }
    let res = await db.query(sqlcmd);
    if (res.values == undefined || res.values?.length == 0) {
      throw new Error("Failed to fetch teams");
    } else {
      await db.close();
      return res.values;
    }
  }

  public async deleteTeam(teamName:string, isMale:boolean): Promise<void> {
    let db = await this.sqlite.createConnection('tgs', false, 'no-encryption', this.dbVersion);
    await db.open();
    let res = await db.run(`delete from teams where teamName = ${teamName} and isMale = ${isMale}`);
    if (res.changes?.changes == 0) {
      throw new Error(`Failed to save game`);
    } else {
      await db.close();
    }
  }

  public async saveTeam(team:Team): Promise<void> {

  }
  // #endregion

  // #region Stats
  public async getStats(gameId:number = 0): Promise<Stat[]> {
    let db = await this.sqlite.createConnection('tgs', false, 'no-encryption', this.dbVersion);
    await db.open();
    let sqlcmd = "select * from stats";
    if (gameId > 0) {
      sqlcmd += ` where gameId = ${gameId}`
    }
    let res = await db.query(sqlcmd);
    if (res.values == undefined || res.values?.length == 0) {
      throw new Error(`Failed to fetch stats for game ${gameId}`);
    } else {
      await db.close();
      return res.values;
    }
  }

  public async saveStat(stat:Stat): Promise<void> {

  }

  public async deleteStat(player:number, game:number): Promise<void> {
    let db = await this.sqlite.createConnection('tgs', false, 'no-encryption', this.dbVersion);
    await db.open();
    let res = await db.run(`delete from stats where player = ${player} and game = ${game}`);
    if (res.changes?.changes == 0) {
      throw new Error(`Failed to save game`);
    } else {
      await db.close();
    }
  }
  // #endregion

  // #region Plays
  public async getPlays(gameId:number = 0): Promise<Play[]> {
    let db = await this.sqlite.createConnection('tgs', false, 'no-encryption', this.dbVersion);
    await db.open();
    let sqlcmd = "select * from plays";
    if (gameId > 0) {
      sqlcmd += ` where gameId = ${gameId}`
    }
    let res = await db.query(sqlcmd);
    if (res.values == undefined || res.values?.length == 0) {
      throw new Error(`Failed to fetch plays for game ${gameId}`);
    } else {
      await db.close();
      return res.values;
    }
  }

  public async savePlay(play:Play): Promise<void> {

  }

  public async deletePlay(data:string, gameId:number): Promise<void> {
    let db = await this.sqlite.createConnection('tgs', false, 'no-encryption', this.dbVersion);
    await db.open();
    let res = await db.run(`delete from plays where data = ${data} and gameId = ${gameId}`);
    if (res.changes?.changes == 0) {
      throw new Error(`Failed to save game`);
    } else {
      await db.close();
    }
  }
  // #endregion
}
