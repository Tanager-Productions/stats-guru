import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Game } from 'src/app/interfaces/models';
import { SqlService } from 'src/app/services/sql/sql.service';

@Component({
  selector: 'app-gamecast-detail',
  templateUrl: './gamecast-detail.component.html',
  styleUrls: ['./gamecast-detail.component.scss']
})
export class GamecastDetailComponent {
	@Input() gameId!:string;
	@Output() dismiss: EventEmitter<void> = new EventEmitter();
	gamecastDetails!:Game;

	constructor(private crud: SqlService) {}

	async ngOnInit() {
		this.gamecastDetails = (await this.crud.rawQuery(`select * from gameCastSettings where game = '${this.gameId}'`))[0];
	}

	async save() {
		await this.crud.save('games', this.gamecastDetails, {"id": this.gamecastDetails.id});
	}

	setCheckbox($event:any) {
		this.gamecastDetails.resetTimeoutsEveryPeriod = $event.detail.checked;
	}

	setPeriods($event:any) {
		this.gamecastDetails.hasFourQuarters = $event.detail.checked;
	}
}
