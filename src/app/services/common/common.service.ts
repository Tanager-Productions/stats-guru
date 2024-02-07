import { Injectable, WritableSignal, signal } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { SqlService } from '../sql/sql.service';
import { Game, Play, Player, Stat, Team, Event } from 'src/app/interfaces/entities';

export type HomePageGame = {
	gameId:number,
	gameDate:string,
	homeTeamName:string,
	awayTeamName:string,
	homeTeamLogo:string|null,
	awayTeamLogo:string|null,
	eventId:number|null
};

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  public homePageGames: WritableSignal<HomePageGame[]> = signal([]);
  public events: WritableSignal<Event[]> = signal([]);

  constructor(private sql:SqlService) { }

  public async initializeService() {
    await Promise.all([
      this.fetchGames(),
      this.fetchEvents()
    ]);
  }

  public async fetchGames() {
    let games = await this.sql.rawQuery(`
			SELECT
				g.id as gameId,
				g.gameDate,
				g.eventId,
				homeTeam.name AS homeTeamName,
				awayTeam.name AS awayTeamName,
				homeTeam.defaultLogo AS homeTeamLogo,
				awayTeam.defaultLogo AS awayTeamLogo
			FROM
				Games g
			JOIN
				Teams AS homeTeam ON g.homeTeamId = homeTeam.id
			JOIN
				Teams AS awayTeam ON g.awayTeamId = awayTeam.id
			ORDER BY
				g.gameDate DESC;
		`);
    this.homePageGames.set(games);
  }

  public async fetchEvents() {
    let events: Event[] = await this.sql.query({
			table: "events",
			orderByColumn: "title",
			orderDirection: "asc"
		});
    this.events.set(events);
  }
}
