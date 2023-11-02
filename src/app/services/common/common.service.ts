import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { SqlService } from '../sql/sql.service';
import { Game, Play, Player, Stat, Team, Event } from 'src/app/interfaces/models';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  private gamesSubject: BehaviorSubject<Game[] | null> = new BehaviorSubject<Game[] | null>(null);
  private eventsSubject: BehaviorSubject<Event[] | null> = new BehaviorSubject<Event[] | null>(null);
  private playersSubject: BehaviorSubject<Player[] | null> = new BehaviorSubject<Player[] | null>(null);
  private playsSubject: BehaviorSubject<Play[] | null> = new BehaviorSubject<Play[] | null>(null);
  private teamsSubject: BehaviorSubject<Team[] | null> = new BehaviorSubject<Team[] | null>(null);
  private statsSubject: BehaviorSubject<Stat[] | null> = new BehaviorSubject<Stat[] | null>(null);

  constructor(private sql:SqlService) { }

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

  public async fetchGames() {
    let games: Game[] = await this.sql.query({
			table: 'games',
			orderByColumn: 'startDate'
		});
    this.gamesSubject.next(games);
  }

  public getGames() {
    return this.gamesSubject.asObservable();
  }

  public async fetchEvents() {
    let events: Event[] = await this.sql.query({
			table: "events",
			orderByColumn: "title",
			orderDirection: "asc"
		});
    this.eventsSubject.next(events);
  }

  public getEvents() {
    return this.eventsSubject.asObservable();
  }

  public async fetchPlayers() {
    let players: Player[] = await this.sql.query({table: "players"});
    this.playersSubject.next(players);
  }

  public getPlayers() {
    return this.playersSubject.asObservable();
  }

  public async fetchPlays() {
    let plays: Play[] = await this.sql.query({table: "plays"});
    this.playsSubject.next(plays);
  }

  public getPlays() {
    return this.playsSubject.asObservable();
  }

  public async fetchTeams() {
    let teams: Team[] = await this.sql.query({table: "teams"});
    this.teamsSubject.next(teams);
  }

  public getTeams() {
    return this.teamsSubject.asObservable();
  }

  public async fetchStats() {
    let stats: Stat[] = await this.sql.query({table: "stats"});
    this.statsSubject.next(stats);
  }

  public getStats() {
    return this.statsSubject.asObservable();
  }
}
