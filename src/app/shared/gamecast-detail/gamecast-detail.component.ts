import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Game } from 'src/app/interfaces/entities';
import { SqlService } from 'src/app/services/sql/sql.service';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
	selector: 'app-gamecast-detail',
	templateUrl: './gamecast-detail.component.html',
	styleUrls: ['./gamecast-detail.component.scss'],
	standalone: true,
	imports: [IonicModule, FormsModule]
})
export class GamecastDetailComponent {
	@Input() game!:Game;
	@Output() dismiss: EventEmitter<void> = new EventEmitter();

	constructor(private crud: SqlService) {}

	async save() {
		await this.crud.save('games', this.game, {"id": this.game.id});
	}

	setCheckbox($event:any) {
		this.game.resetTimeoutsEveryPeriod = $event.detail.checked ? 1 : 0;
	}

	setPeriods($event:any) {
		this.game.hasFourQuarters = $event.detail.checked ? 1 : 0;
	}
}
