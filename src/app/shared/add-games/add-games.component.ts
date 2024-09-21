import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonService } from 'src/app/services/common/common.service';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { database } from 'src/app/app.db';
import { Team, SyncState } from 'src/app/app.types';
import { defaultGame } from 'src/app/app.utils';

@Component({
	selector: 'app-add-games',
	templateUrl: './add-games.component.html',
	styleUrls: ['./add-games.component.scss'],
	standalone: true,
	imports: [IonicModule, FormsModule, NgFor, NgIf],
	host: { class: 'page' }
})
export class AddGamesComponent {
	protected common = inject(CommonService);
	protected teams?: Team[];
	protected isMale = true;
	protected date: string = new Date().toJSON();
	protected homeTeam: Team | null = null;
	protected awayTeam: Team | null = null;
	protected eventId: number | null = null;
	@Output() dismiss: EventEmitter<void> = new EventEmitter<void>();

	async ngOnInit() {
    this.teams = await database.teams.orderBy('name').toArray();
	}

	async addGame() {
		let currentSeasonId = 0;
		await database.seasons.orderBy('year').last().then(latestModifiedObject => {
			currentSeasonId = latestModifiedObject!.year;
		});
		await database.games.add({
			...defaultGame,
			id: undefined!,
			season_id: currentSeasonId,
			sync_state: SyncState.Added,
			event_id: this.eventId,
			game_date: new Date(this.date).toJSON(),
			settings: {
				reset_timeouts: 4,
				full_timeouts: 2,
				partial_timeouts: 1,
				minutes_per_overtime: 4,
				minutes_per_period: 9,
				reset_fouls: 1
			},
			period: 0,
			home_team_id: this.homeTeam!.id,
			away_team_id: this.awayTeam!.id,
		});
		this.dismiss.emit();
		this.common.fetchGames();
	}
}
