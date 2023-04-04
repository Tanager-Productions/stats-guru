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
    await this.fetchGames();
    this.isGamesReady.next(true);
  }

  public gameState() {
    return this.isGamesReady.asObservable();
  }

  public async fetchGames() {
    let db = await this.sql.createConnection();
    await db.open();
    let games: Game[] = await this.crud.query(db, "games", false, undefined, "gameDate", false);
    await db.close();
    this.gamesSubject.next(games);
  }

  public getGames() {
    return this.gamesSubject.asObservable();
  }
}
