import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { database } from 'src/app/app.db';
import { Game } from 'src/app/types/models';

@Component({
	selector: 'app-gamecast-detail',
	templateUrl: './gamecast-detail.component.html',
	styleUrls: ['./gamecast-detail.component.scss'],
	standalone: true,
	imports: [IonicModule, FormsModule]
})
export class GamecastDetailComponent {
	@Input() game!: Game;

	async save() {
		await database.games.put(this.game);
	}
}
