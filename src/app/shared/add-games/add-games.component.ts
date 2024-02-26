import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonService } from 'src/app/services/common/common.service';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Team, defaultGame } from '@tanager/tgs';
import { SyncState } from 'src/app/types/models';
import { database } from 'src/app/app.db';

@Component({
	selector: 'app-add-games',
	templateUrl: './add-games.component.html',
	styleUrls: ['./add-games.component.scss'],
	standalone: true,
	imports: [IonicModule, FormsModule, NgFor, NgIf]
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
		await database.games.add({
			...defaultGame,
			syncState: SyncState.Added,
			eventId: this.eventId,
			gameDate: new Date(this.date).toJSON(),
			homeTeam: {
				teamId: this.homeTeam!.id,
				teamName: this.homeTeam!.name,
				isMale: this.homeTeam!.isMale,
				seasonId: this.homeTeam!.seasonId,
				teamType: this.homeTeam!.teamType
			},
			awayTeam: {
				teamId: this.awayTeam!.id,
				teamName: this.awayTeam!.name,
				isMale: this.awayTeam!.isMale,
				seasonId: this.awayTeam!.seasonId,
				teamType: this.awayTeam!.teamType
			}
		});
		this.dismiss.emit();
		this.common.fetchGames();
	}
}
