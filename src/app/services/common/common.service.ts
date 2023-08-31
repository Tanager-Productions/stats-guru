import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Game } from 'src/app/interfaces/game.interface';
import { Player } from 'src/app/interfaces/player.interface';
import { Play } from 'src/app/interfaces/play.interface';
import { Team } from 'src/app/interfaces/team.interface';
import { Stat } from 'src/app/interfaces/stat.interface';
import { SqlService } from '../sql/sql.service';
import { Event } from 'src/app/interfaces/event.interface';

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
    let games: Game[] = await this.sql.query("games", undefined, "gameDate", 'desc');
    this.gamesSubject.next(games);
  }

  public getGames() {
    return this.gamesSubject.asObservable();
  }

  public async fetchEvents() {
    let events: Event[] = await this.sql.query("events", undefined, "title", "asc");
    this.eventsSubject.next(events);
  }

  public getEvents() {
    return this.eventsSubject.asObservable();
  }

  public async fetchPlayers() {
    let players: Player[] = await this.sql.query("players");
    this.playersSubject.next(players);
  }

  public getPlayers() {
    return this.playersSubject.asObservable();
  }

  public async fetchPlays() {
    let plays: Play[] = await this.sql.query("plays");
    this.playsSubject.next(plays);
  }

  public getPlays() {
    return this.playsSubject.asObservable();
  }

  public async fetchTeams() {
    let teams: Team[] = await this.sql.query("teams");
    this.teamsSubject.next(teams);
  }

  public getTeams() {
    return this.teamsSubject.asObservable();
  }

  public async fetchStats() {
    let stats: Stat[] = await this.sql.query("stats");
    this.statsSubject.next(stats);
  }

  public getStats() {
    return this.statsSubject.asObservable();
  }
}
