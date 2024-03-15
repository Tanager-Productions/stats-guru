import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Player, Stat, SyncState } from 'src/app/types/models';
import { defaultPlayer } from '@tanager/tgs';

@Component({
	selector: 'app-add-player',
	templateUrl: './add-player.component.html',
	styleUrls: ['./add-player.component.scss'],
	standalone: true,
	imports: [IonicModule, FormsModule]
})
export class AddPlayerComponent {
	protected tab: "add" | "hide" = "add";
	protected newPlayerNumber: number = 0;
	protected newPlayerFirstName!: string;
	protected newPlayerLastName!: string;
	@Input({ required: true }) team!: 'home' | 'away';
	@Input({ required: true }) teamId!: number;
	@Input({ required: true }) isMale!: boolean;
	@Input({ required: true }) stats!: Stat[];
	@Input({ required: true }) color!: string;
	@Input({ required: true }) players!: Player[];
	protected mapping: {stat?: Stat, player: Player}[] = [];
	@Output() dismiss: EventEmitter<void> = new EventEmitter();
	@Output() playerAdded: EventEmitter<Player> = new EventEmitter();
	@Output() playerHiddenChanged: EventEmitter<Player> = new EventEmitter();

	ngOnInit() {
		this.mapping = this.players.map(player => {
			const stat = this.stats.find(t => t.playerId == player.id);
			return { stat, player };
		})
	}

	public addToTeam() {
		this.playerAdded.emit({
			...defaultPlayer,
			syncState: SyncState.Added,
			firstName: this.newPlayerFirstName,
			lastName: this.newPlayerLastName,
			number: this.newPlayerNumber,
			teamId: this.teamId,
			isMale: this.isMale
		});
		this.dismiss.emit();
	}
}
