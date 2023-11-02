import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Game, Player, Positions } from 'src/app/interfaces/models';
import { SyncState } from 'src/app/interfaces/syncState.enum';

@Component({
  selector: 'app-add-player',
  templateUrl: './add-player.component.html',
  styleUrls: ['./add-player.component.scss']
})
export class AddPlayerComponent {
	tab:"add"|"hide" = "add";
	newPlayerNumber!: number;
	newPlayerFirstName!: string;
	newPlayerLastName!: string;
	@Input() team!: 'home' | 'away';
	@Input() teamId!:number;
	@Input() isMale!:boolean;
	@Output() dismiss: EventEmitter<void> = new EventEmitter();
	@Output() playerAdded: EventEmitter<Player> = new EventEmitter();
	@Output() playerHidden: EventEmitter<Player> = new EventEmitter();
	@Output() playerUnhidden: EventEmitter<Player> = new EventEmitter();
	@Input() color!:string;
	@Input() players!: Player[];
	@Input() settings!: Game;

	public addToTeam() {
		let newTeamPlayer: Player = {
			id: 0,
			firstName: this.newPlayerFirstName,
			lastName: this.newPlayerLastName,
			number: this.newPlayerNumber,
			position: Positions.PointGuard,
			teamId: this.teamId,
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

	isHidden(player:Player) {
		return this.settings.hiddenPlayers?.split(',').includes(player.id.toString());
	}
}
