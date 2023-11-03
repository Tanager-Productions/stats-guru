import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Game } from 'src/app/interfaces/models';
import { SqlService } from 'src/app/services/sql/sql.service';

@Component({
  selector: 'app-gamecast-detail',
  templateUrl: './gamecast-detail.component.html',
  styleUrls: ['./gamecast-detail.component.scss']
})
export class GamecastDetailComponent {
	@Input() game!:Game;
	@Output() dismiss: EventEmitter<void> = new EventEmitter();

	constructor(private crud: SqlService) {}

	async save() {
		await this.crud.save('games', this.game, {"id": this.game.id});
	}

	setCheckbox($event:any) {
		this.game.resetTimeoutsEveryPeriod = $event.detail.checked;
	}

	setPeriods($event:any) {
		this.game.hasFourQuarters = $event.detail.checked;
	}
}
