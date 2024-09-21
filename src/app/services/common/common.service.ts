import { Injectable, signal } from '@angular/core';
import { Event } from 'src/app/app.types';
import { database } from 'src/app/app.db';
import { format } from 'date-fns';

export type HomePageGame = {
	gameId: number,
	gameDay: string,
	gameTime: string,
	gameDate: Date,
	homeTeamName: string,
	awayTeamName: string,
	homeTeamScore: number,
	awayTeamScore: number,
	eventTitle: string | undefined
};

@Injectable({
	providedIn: 'root'
})
export class CommonService {
	private homePageGamesSrc = signal<HomePageGame[]>([]);
	public homePageGames = this.homePageGamesSrc.asReadonly();
	private eventsSrc = signal<Event[]>([]);
	public events = this.eventsSrc.asReadonly();

	public async initializeService() {
		await Promise.all([
			this.fetchGames(),
			this.fetchEvents()
		]);
	}

	public async fetchGames() {
		const res = await database.transaction('r', ['games', 'teams', 'events'], async () => {
			var games = await database.games.orderBy('game_date').reverse().toArray();
			var teams = await database.teams.toArray();
			var events = await database.events.toArray();
			return games.map(game => ({
				gameId: game.id,
				gameDay: format(game.game_date, 'EEEE'),
				gameDate: new Date(game.game_date),
				gameTime: format(game.game_date, 'p'),
				eventTitle: events.find(t => t.id == game.event_id)?.title,
				homeTeamName: teams.find(t => t.id == game.home_team_id)!.name,
				awayTeamName: teams.find(t => t.id == game.away_team_id)!.name,
				homeTeamScore: game.home_final,
				awayTeamScore: game.away_final,
			}))
		});
		this.homePageGamesSrc.set(res);
	}

	public async fetchEvents() {
		this.eventsSrc.set(await database.events.toArray());
	}
}
