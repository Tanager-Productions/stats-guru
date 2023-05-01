import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Game } from 'src/app/interfaces/game.interface';
import { Player } from 'src/app/interfaces/player.interface';
import { Play } from 'src/app/interfaces/play.interface';
import { Team } from 'src/app/interfaces/team.interface';
import { Stat } from 'src/app/interfaces/stat.interface';
import { CrudService } from '../crud/crud.service';
import { SqlService } from '../sql/sql.service';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';

export interface CommonSubject<table> {
  ready: boolean
  values: table[]
}

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  private gamesSubject: BehaviorSubject<CommonSubject<Game>> = new BehaviorSubject<CommonSubject<Game>>({ready: false, values: []});
  private playersSubject: BehaviorSubject<CommonSubject<Player>> = new BehaviorSubject<CommonSubject<Player>>({ready: false, values: []});
  private playsSubject: BehaviorSubject<CommonSubject<Play>> = new BehaviorSubject<CommonSubject<Play>>({ready: false, values: []});
  private teamsSubject: BehaviorSubject<CommonSubject<Team>> = new BehaviorSubject<CommonSubject<Team>>({ready: false, values: []});
  private statsSubject: BehaviorSubject<CommonSubject<Stat>> = new BehaviorSubject<CommonSubject<Stat>>({ready: false, values: []});

  constructor(private crud: CrudService, private sql:SqlService) { }

  public async initializeService() {
    let db = await this.sql.createConnection();
    await db.open();
    await Promise.all([
      this.fetchPlayers(db),
      this.fetchGames(db),
      this.fetchPlays(db),
      this.fetchStats(db),
      this.fetchTeams(db)
    ]);
    await db.close()
  }

  public async fetchGames(db: SQLiteDBConnection) {
    let games: Game[] = await this.crud.query(db, "games", false, undefined, "gameDate", 'asc');
    this.gamesSubject.next({ready: true, values: games});
  }

  public getGames() {
    return this.gamesSubject.asObservable();
  }

  public async fetchPlayers(db: SQLiteDBConnection) {
    let players: Player[] = await this.crud.query(db, "players", false, undefined, "lastName", 'desc');
    this.playersSubject.next({ready: true, values: players});
  }

  public getPlayers() {
    return this.playersSubject.asObservable();
  }

  public async fetchPlays(db: SQLiteDBConnection) {
    let plays: Play[] = await this.crud.query(db, "plays", false, undefined, "gameId", 'desc');
    this.playsSubject.next({ready: true, values: plays});
  }

  public getPlays() {
    return this.playsSubject.asObservable();
  }

  public async fetchTeams(db: SQLiteDBConnection) {
    let teams: Team[] = await this.crud.query(db, "teams", false, undefined, "name", 'desc');
    this.teamsSubject.next({ready: true, values: teams});
  }

  public getTeams() {
    return this.teamsSubject.asObservable();
  }

  public async fetchStats(db: SQLiteDBConnection) {
    let stats: Stat[] = await this.crud.query(db, "stats", false, undefined, "player", 'desc');
    this.statsSubject.next({ready: true, values: stats});
  }

  public getStats() {
    return this.statsSubject.asObservable();
  }
}
