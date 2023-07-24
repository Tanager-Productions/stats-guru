import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Game } from 'src/app/interfaces/game.interface';
import { Player } from 'src/app/interfaces/player.interface';
import { Play } from 'src/app/interfaces/play.interface';
import { Team } from 'src/app/interfaces/team.interface';
import { Stat } from 'src/app/interfaces/stat.interface';
import { CrudService } from '../crud/crud.service';
import { SqlService } from '../sql/sql.service';
import { Event } from 'src/app/interfaces/event.interface';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  private gamesSubject: BehaviorSubject<Game[]> = new BehaviorSubject<Game[]>([]);
  private isGamesReady: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private eventsSubject: BehaviorSubject<Event[]> = new BehaviorSubject<Event[]>([]);
  private isEventsReady: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
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
    await Promise.all([
      this.fetchPlayers(),
      this.fetchGames(),
      this.fetchPlays(),
      this.fetchStats(),
      this.fetchTeams(),
      this.fetchEvents()
    ]);
  }

  public gameState() {
    return this.isGamesReady.asObservable();
  }

  public async fetchGames() {
    let games: Game[] = await this.crud.query("games", undefined, "gameDate", 'desc');
    this.gamesSubject.next(games);
    this.isGamesReady.next(true);
  }

  public getGames() {
    return this.gamesSubject.asObservable();
  }

  public eventState() {
    return this.isEventsReady.asObservable();
  }

  public async fetchEvents() {
    let events: Event[] = await this.crud.query("events", undefined, "title", "asc");
    this.eventsSubject.next(events);
    this.isEventsReady.next(true);
  }

  public getEvents() {
    return this.eventsSubject.asObservable();
  }

  public playerState() {
    return this.isPlayersReady.asObservable();
  }

  public async fetchPlayers() {
    let players: Player[] = await this.crud.query("players");
    this.playersSubject.next(players);
    this.isPlayersReady.next(true);
  }

  public getPlayers() {
    return this.playersSubject.asObservable();
  }

  public playState() {
    return this.isPlaysReady.asObservable();
  }

  public async fetchPlays() {
    let plays: Play[] = await this.crud.query("plays");
    this.playsSubject.next(plays);
    this.isPlaysReady.next(true);
  }

  public getPlays() {
    return this.playsSubject.asObservable();
  }

  public teamState() {
    return this.isTeamsReady.asObservable();
  }

  public async fetchTeams() {
    let teams: Team[] = await this.crud.query("teams");
    this.teamsSubject.next(teams);
    this.isTeamsReady.next(true);
  }

  public getTeams() {
    return this.teamsSubject.asObservable();
  }

  public statState() {
    return this.isStatsReady.asObservable();
  }

  public async fetchStats() {
    let stats: Stat[] = await this.crud.query("stats");
    this.statsSubject.next(stats);
    this.isStatsReady.next(true);
  }

  public getStats() {
    return this.statsSubject.asObservable();
  }
}
