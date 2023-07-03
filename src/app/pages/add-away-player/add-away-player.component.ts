import { Component, EventEmitter, Output } from '@angular/core';
import { Player } from 'src/app/interfaces/player.interface';
import { CrudService } from 'src/app/services/crud/crud.service';
import { GamecastComponent } from '../home/components/gamecast/gamecast.component';
import { SyncState } from 'src/app/interfaces/syncState.enum';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-add-away-player',
  templateUrl: './add-away-player.component.html',
  styleUrls: ['./add-away-player.component.scss']
})
export class AddAwayPlayerComponent {
	newPlayerNumber!: number;
	newPlayerFirstName!: string;
	newPlayerLastName!: string;
	@Output() dismiss: EventEmitter<void> = new EventEmitter();

	constructor(
		private crud: CrudService,
		private gameCast: GamecastComponent,
		private modalController: ModalController
		) {}

		async addToTeam(team: 'home' | 'away') {
			let newTeamPlayer: Player = {
				playerId: 0,
				firstName: this.newPlayerFirstName || "New",
				lastName: this.newPlayerLastName || "Player",
				number: Number(this.newPlayerNumber),
				position: "",
				team: team == 'home' ? this.gameCast.currentGame!.homeTeam : this.gameCast.currentGame!.awayTeam,
				picture: null,
				isMale: this.gameCast.currentGame!.isMale!,
				syncState: SyncState.Added,
				height: null,
				weight: null,
				age: null,
				homeState: null,
				homeTown: null,
				socialMediaString: null
			}

			if (team == 'home') {
				this.gameCast.homeTeamPlayers!.push(newTeamPlayer);
			} else {
				this.gameCast.awayTeamPlayers!.push(newTeamPlayer);
			}

			await this.crud.save(this.gameCast.db, "Players", newTeamPlayer);
			return this.modalController.dismiss();
		}
}
