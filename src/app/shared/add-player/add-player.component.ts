import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Player } from 'src/app/interfaces/player.interface';
import { SyncState } from 'src/app/interfaces/syncState.enum';

@Component({
  selector: 'app-add-player',
  templateUrl: './add-player.component.html',
  styleUrls: ['./add-player.component.scss']
})
export class AddPlayerComponent {
	newPlayerNumber!: number;
	newPlayerFirstName!: string;
	newPlayerLastName!: string;
	@Input() team!: 'home' | 'away';
	@Input() teamName!:string;
	@Input() isMale!:string;
	@Output() dismiss: EventEmitter<void> = new EventEmitter();
	@Output() playerAdded: EventEmitter<Player> = new EventEmitter();
	@Input() color!:string;

	public addToTeam() {
		let newTeamPlayer: Player = {
			playerId: crypto.randomUUID(),
			firstName: this.newPlayerFirstName,
			lastName: this.newPlayerLastName,
			number: this.newPlayerNumber,
			position: "",
			team: this.teamName,
			picture: null,
			isMale: this.isMale,
			syncState: SyncState.Added,
			height: null,
			weight: null,
			age: null,
			homeState: null,
			homeTown: null,
			socialMediaString: null
		}

		this.playerAdded.emit(newTeamPlayer);
		this.dismiss.emit();
	}
}
