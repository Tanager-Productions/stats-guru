import { Injectable, WritableSignal, signal } from '@angular/core';
import { Event } from '@tanager/tgs';
import { database } from 'src/app/app.db';

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
  private homePageGamesSrc: WritableSignal<HomePageGame[]> = signal([]);
	public homePageGames = this.homePageGamesSrc.asReadonly();
  private eventsSrc: WritableSignal<Event[]> = signal([]);
	public events = this.eventsSrc.asReadonly();

  public async initializeService() {
    await Promise.all([
      this.fetchGames(),
      this.fetchEvents()
    ]);
  }

  public async fetchGames() {
    const res = await database.transaction('r', ['games', 'teams'], async () => {
			var games = await database.games.toArray();
			var teams = await database.teams.toArray();
			return games.map(game => ({
				gameId: game.id,
				gameDate: game.gameDate,
				eventId: game.eventId,
				homeTeamName: game.homeTeam.teamName,
				awayTeamName: game.awayTeam.teamName,
				homeTeamLogo: teams.find(t => t.id == game.homeTeam.teamId)!.defaultLogo,
				awayTeamLogo: teams.find(t => t.id == game.awayTeam.teamId)!.defaultLogo
			}))
		});
		this.homePageGamesSrc.set(res);
  }

  public async fetchEvents() {
    this.eventsSrc.set(await database.events.toArray());
  }
}
