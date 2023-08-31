import { Component, EventEmitter, Output } from '@angular/core';
import { Game } from 'src/app/interfaces/game.interface';
import { Team } from 'src/app/interfaces/team.interface';
import { Event } from 'src/app/interfaces/event.interface'
import { SqlService } from 'src/app/services/sql/sql.service';
import { SyncState } from 'src/app/interfaces/syncState.enum';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { CommonService } from 'src/app/services/common/common.service';

@Component({
  selector: 'app-add-games',
  templateUrl: './add-games.component.html',
  styleUrls: ['./add-games.component.scss']
})
export class AddGamesComponent {
	teams?: Team[];
	events?: Event[];
	isMale: number = 1;
	date: string = new Date().toJSON();
	homeTeam:string = '';
	awayTeam:string = '';
	event:number | null = null;
	@Output() dismiss: EventEmitter<void> = new EventEmitter<void>();

  constructor(private crud: SqlService, private common: CommonService) {}

	async ngOnInit() {
    this.teams = await this.crud.query('teams');
    this.events = await this.crud.query('events');
	}

	async addGame() {
		let game: Game = {
			gameId: crypto.randomUUID(),
			homeTeam: this.homeTeam,
			awayTeam: this.awayTeam,
			gameDate: new Date(this.date).toJSON(),
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
			isMale: this.isMale,
			clock: '00:00',
			homeTeamTOL: 0,
			awayTeamTOL:0,
			has4Quarters: 0,
			homeFinal: 0,
			awayFinal: 0,
			period: 0,
			gameLink: null,
			eventId: this.event,
			syncState: SyncState.Added,
			complete: 1
		}
		await this.crud.save('games', game);
		this.dismiss.emit();
		this.common.fetchGames();
	}
}
