import { Component, EventEmitter, Output } from '@angular/core';
import { SqlService } from 'src/app/services/sql/sql.service';
import { SyncState } from 'src/app/interfaces/syncState.enum';
import { CommonService } from 'src/app/services/common/common.service';
import { Team, Event, Game, DEFAULT_GAME } from 'src/app/interfaces/models';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
	selector: 'app-add-games',
	templateUrl: './add-games.component.html',
	styleUrls: ['./add-games.component.scss'],
	standalone: true,
	imports: [IonicModule, FormsModule, NgFor, NgIf]
})
export class AddGamesComponent {
	teams?: Team[];
	isMale: number = 1;
	date: string = new Date().toJSON();
	homeTeamId:number = 0;
	awayTeamId:number = 0;
	event:number | null = null;
	@Output() dismiss: EventEmitter<void> = new EventEmitter<void>();

  constructor(private crud: SqlService, public common: CommonService) {}

	async ngOnInit() {
    this.teams = await this.crud.query({table: 'teams', orderByColumn: 'name'});
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
