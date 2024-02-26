import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NgIf, NgFor } from '@angular/common';
import { Game, Player, Stat, SyncState } from 'src/app/types/models';
import { defaultPlayer } from '@tanager/tgs';

@Component({
	selector: 'app-add-player',
	templateUrl: './add-player.component.html',
	styleUrls: ['./add-player.component.scss'],
	standalone: true,
	imports: [NgIf, IonicModule, FormsModule, NgFor]
})
export class AddPlayerComponent {
	tab: "add" | "hide" = "add";
	newPlayerNumber: number = 0;
	newPlayerFirstName!: string;
	newPlayerLastName!: string;
	@Input() team!: 'home' | 'away';
	@Input() teamId!: number;
	@Input() isMale!: boolean;
	@Input() stat!: Stat;
	@Output() dismiss: EventEmitter<void> = new EventEmitter();
	@Output() playerAdded: EventEmitter<Player> = new EventEmitter();
	@Output() playerHidden: EventEmitter<Player> = new EventEmitter();
	@Output() playerUnhidden: EventEmitter<Player> = new EventEmitter();
	@Input() color!: string;
	@Input() players!: Player[];
	@Input() settings!: Game;

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
