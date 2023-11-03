import { Component, EventEmitter, Output } from '@angular/core';
import { SqlService } from 'src/app/services/sql/sql.service';
import { SyncState } from 'src/app/interfaces/syncState.enum';
import { CommonService } from 'src/app/services/common/common.service';
import { Team, Event, Game, DEFAULT_GAME } from 'src/app/interfaces/models';

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
		let game = DEFAULT_GAME;
		game.homeTeamId = this.homeTeamId;
		game.awayTeamId = this.awayTeamId;
		game.gameDate = new Date(this.date).toJSON();
		game.eventId = this.event;
		game.syncState = SyncState.Added;
		await this.crud.save('games', game);
		this.dismiss.emit();
		this.common.fetchGames();
	}
}
