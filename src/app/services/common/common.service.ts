import { Injectable, WritableSignal, signal } from '@angular/core';
import { Event } from '@tanager/tgs';
import { database } from 'src/app/app.db';

export type HomePageGame = {
	gameId:number,
	gameDay:string,
	gameDate:Date,
	homeTeamName:string,
	awayTeamName:string,
	homeTeamScore:number,
	awayTeamScore:number,
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
			var games = await database.games.orderBy('gameDate').reverse().toArray();
			var weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
			return games.map(game => ({
				gameId: game.id,
				gameDay: weekday[new Date(game.gameDate).getDay()],
				gameDate: new Date(game.gameDate),
				eventId: game.eventId,
				homeTeamName: game.homeTeam.teamName,
				awayTeamName: game.awayTeam.teamName,
				homeTeamScore: game.homeFinal,
				awayTeamScore: game.awayFinal,
			}))
		});
		this.homePageGamesSrc.set(res);
  }

  public async fetchEvents() {
    this.eventsSrc.set(await database.events.toArray());
  }
}
