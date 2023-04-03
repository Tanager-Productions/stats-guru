import { Injectable } from '@angular/core';
import { TgsDatabaseService } from '../tgs/tgs-database.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { Game } from 'src/app/interfaces/game.interface';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  private gamesSubject: BehaviorSubject<Game[]> = new BehaviorSubject<Game[]>([]);
  private isGamesReady: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private playersSubject: BehaviorSubject<Game[]> = new BehaviorSubject<Game[]>([]);
  private isPlayersReady: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private playsSubject: BehaviorSubject<Game[]> = new BehaviorSubject<Game[]>([]);
  private isPlaysReady: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private teamsSubject: BehaviorSubject<Game[]> = new BehaviorSubject<Game[]>([]);
  private isTeamsReady: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private statsSubject: BehaviorSubject<Game[]> = new BehaviorSubject<Game[]>([]);
  private isStatsReady: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private dbContext: TgsDatabaseService) { }

  public async initializeService() {
    await this.fetchGames();
    this.isGamesReady.next(true);
  }

  public gameState() {
    return this.isGamesReady.asObservable();
  }

  public async fetchGames() {
    let games = await this.dbContext.getGames();
    this.gamesSubject.next(games);
  }

  public getGames() {
    return this.gamesSubject.asObservable();
  }
}
