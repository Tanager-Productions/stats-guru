import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GameCastSettings } from 'src/app/interfaces/gameCastSetting.interface';
import { Player } from 'src/app/interfaces/player.interface';
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
	@Input() teamName!:string;
	@Input() isMale!:number;
	@Output() dismiss: EventEmitter<void> = new EventEmitter();
	@Output() playerAdded: EventEmitter<Player> = new EventEmitter();
	@Output() playerHidden: EventEmitter<Player> = new EventEmitter();
	@Output() playerUnhidden: EventEmitter<Player> = new EventEmitter();
	@Input() color!:string;
	@Input() players!: Player[];
	@Input() settings!: GameCastSettings;

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

	isHidden(player:Player) {
		return this.settings.hiddenPlayers?.split(',').includes(player.playerId);
	}
}
