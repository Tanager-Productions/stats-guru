import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Game } from 'src/app/interfaces/game.interface';
import { Player } from 'src/app/interfaces/player.interface';
import { Play } from 'src/app/interfaces/play.interface';
import { Team } from 'src/app/interfaces/team.interface';
import { Stat } from 'src/app/interfaces/stat.interface';
import { CrudService } from '../crud/crud.service';
import { SqlService } from '../sql/sql.service';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  private gamesSubject: BehaviorSubject<Game[]> = new BehaviorSubject<Game[]>([]);
  private isGamesReady: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private playersSubject: BehaviorSubject<Player[]> = new BehaviorSubject<Player[]>([]);
  private isPlayersReady: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private playsSubject: BehaviorSubject<Play[]> = new BehaviorSubject<Play[]>([]);
  private isPlaysReady: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private teamsSubject: BehaviorSubject<Team[]> = new BehaviorSubject<Team[]>([]);
  private isTeamsReady: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private statsSubject: BehaviorSubject<Stat[]> = new BehaviorSubject<Stat[]>([]);
  private isStatsReady: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private crud: CrudService, private sql:SqlService) { }

  public async initializeService() {
    await this.fetchPlayers();
    await this.fetchGames();
    await this.fetchPlays();
    await this.fetchStats();
    await this.fetchTeams();
    this.isGamesReady.next(true);
    this.isPlayersReady.next(true);
    this.isPlaysReady.next(true);
    this.isStatsReady.next(true);
    this.isTeamsReady.next(true);
  }

  public gameState() {
    return this.isGamesReady.asObservable();
  }

  public async fetchGames() {
    let db = await this.sql.createConnection();
    await db.open();
    let games: Game[] = await this.crud.query(db, "games", false, undefined, "gameDate", 'desc');
    await db.close();
    this.gamesSubject.next(games);
  }

  public getGames() {
    return this.gamesSubject.asObservable();
  }

  public playerState() {
    return this.isPlayersReady.asObservable();
  }

  public async fetchPlayers() {
    let db = await this.sql.createConnection();
    await db.open();
    let players: Player[] = await this.crud.query(db, "players", false, undefined, "lastName", 'asc');
    await db.close();
    this.playersSubject.next(players);
  }

  public getPlayers() {
    return this.playersSubject.asObservable();
  }

  public playState() {
    return this.isPlaysReady.asObservable();
  }

  public async fetchPlays() {
    let db = await this.sql.createConnection();
    await db.open();
    let plays: Play[] = await this.crud.query(db, "plays", false, undefined, "gameId", 'asc');
    await db.close();
    this.playsSubject.next(plays);
  }

  public getPlays() {
    return this.playsSubject.asObservable();
  }

  public teamState() {
    return this.isTeamsReady.asObservable();
  }

  public async fetchTeams() {
    let db = await this.sql.createConnection();
    await db.open();
    let teams: Team[] = await this.crud.query(db, "teams", false, undefined, "name", 'asc');
    await db.close();
    this.teamsSubject.next(teams);
  }

  public getTeams() {
    return this.teamsSubject.asObservable();
  }

  public statState() {
    return this.isStatsReady.asObservable();
  }

  public async fetchStats() {
    let db = await this.sql.createConnection();
    await db.open();
    let stats: Stat[] = await this.crud.query(db, "stats", false, undefined, "player", 'asc');
    await db.close();
    this.statsSubject.next(stats);
  }

  public getStats() {
    return this.statsSubject.asObservable();
  }
}
