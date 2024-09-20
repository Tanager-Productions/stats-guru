import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { database } from 'src/app/app.db';
import { Game, SyncState } from 'src/app/app.types';

@Component({
	selector: 'app-gamecast-detail',
	templateUrl: './gamecast-detail.component.html',
	styleUrls: ['./gamecast-detail.component.scss'],
	standalone: true,
	imports: [IonicModule, FormsModule]
})
export class GamecastDetailComponent {
	@Input() game!: Game & { sync_state: SyncState };
	@Output() dismiss = new EventEmitter<void>();

	async save() {
		await database.games.put(this.game);
		this.dismiss.emit();
	}
}
