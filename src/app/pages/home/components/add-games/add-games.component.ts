import { Component } from '@angular/core';
import { Game } from 'src/app/interfaces/game.interface';
import { Team } from 'src/app/interfaces/team.interface';
import { Event } from 'src/app/interfaces/event.interface'
import { CrudService } from 'src/app/services/crud/crud.service';
import { SqlService } from 'src/app/services/sql/sql.service';
import { SyncState } from 'src/app/interfaces/syncState.enum';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-games',
  templateUrl: './add-games.component.html',
  styleUrls: ['./add-games.component.scss']
})
export class AddGamesComponent {
	game!: Game;
	games?: Game[];
	teams?: Team[];
	events?: Event[];
	isMale?: string;
	date?: any;

  constructor(private crud: CrudService, private sql: SqlService, private router: Router) {}

	ngOnInit() {
		this.fetchData();
	}

	private async fetchData() {
    this.teams = await this.crud.rawQuery(`
			SELECT 		*
			FROM 			Teams
			WHERE 		isMale = ${this.isMale}
			ORDER BY 	name ASC;
		`);

    this.events = await this.crud.rawQuery(`
			SELECT 		*
			FROM 			Events
			ORDER BY 	eventId ASC;
		`);
	}

	setGender(gender: string) {
		this.isMale = gender;
		this.fetchData();
	}

  navigateToGames() {
    this.router.navigateByUrl('/games');
  }

	async addGame(homeTeam: any, awayTeam: any, gender: any, event: any) {
		var date  = new Date(this.date);
		var stringToSaveToDatabase = date.toJSON();
		let game: Game = {
			gameId: crypto.randomUUID(),
			homeTeam: homeTeam,
			awayTeam: awayTeam,
			gameDate: stringToSaveToDatabase,
			homePointsQ1: 0,
			awayPointsQ1: 0,
			homePointsQ2: 0,
			awayPointsQ2: 0,
			homePointsQ3: 0,
			awayPointsQ3: 0,
			homePointsQ4: 0,
			awayPointsQ4: 0,
			homePointsOT: 0,
			awayPointsOT: 0,
			isMale: gender,
			clock: '00:00',
			homeTeamTOL: 0,
			awayTeamTOL:0,
			has4Quarters: 0,
			homeFinal: 0,
			awayFinal: 0,
			period: 0,
			gameLink: null,
			eventId: event,
			syncState: SyncState.Added,
			complete: 1
		}
		await this.crud.save('games', game);
		this.navigateToGames();
	}
}
