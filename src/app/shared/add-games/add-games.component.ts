import { Component, EventEmitter, Output } from '@angular/core';
import { SqlService } from 'src/app/services/sql/sql.service';
import { SyncState } from 'src/app/interfaces/syncState.enum';
import { CommonService } from 'src/app/services/common/common.service';
import { Team, Event, Game } from 'src/app/interfaces/models';

@Component({
  selector: 'app-add-games',
  templateUrl: './add-games.component.html',
  styleUrls: ['./add-games.component.scss']
})
export class AddGamesComponent {
	teams?: Team[];
	events?: Event[];
	isMale: boolean = true;
	date: string = new Date().toJSON();
	homeTeamId:number = 0;
	awayTeamId:number = 0;
	event:number | null = null;
	@Output() dismiss: EventEmitter<void> = new EventEmitter<void>();

  constructor(private crud: SqlService, private common: CommonService) {}

	async ngOnInit() {
    this.teams = await this.crud.query({table: 'teams'});
    this.events = await this.crud.query({table: 'events'});
	}

	async addGame() {
		let game: Game = {
			id: 0,
			homeTeamId: this.homeTeamId,
			awayTeamId: this.awayTeamId,
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
			clock: '00:00',
			homeTeamTOL: 0,
			awayTeamTOL:0,
			hasFourQuarters: false,
			homeFinal: 0,
			awayFinal: 0,
			period: 0,
			gameLink: null,
			eventId: this.event,
			syncState: SyncState.Added,
			complete: true
		}
		await this.crud.save('games', game);
		this.dismiss.emit();
		this.common.fetchGames();
	}
}
