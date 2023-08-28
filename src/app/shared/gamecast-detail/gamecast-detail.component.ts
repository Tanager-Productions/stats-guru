import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GameCastSettings } from 'src/app/interfaces/gameCastSetting.interface';
import { SqlService } from 'src/app/services/sql/sql.service';

@Component({
  selector: 'app-gamecast-detail',
  templateUrl: './gamecast-detail.component.html',
  styleUrls: ['./gamecast-detail.component.scss']
})
export class GamecastDetailComponent {
	@Input() gameId!:string;
	@Output() dismiss: EventEmitter<void> = new EventEmitter();
	gamecastDetails!:GameCastSettings;

	constructor(private crud: SqlService) {}

	async ngOnInit() {
		this.gamecastDetails = (await this.crud.rawQuery(`select * from gameCastSettings where game = '${this.gameId}'`))[0];
	}

	async save() {
		await this.crud.save('gameCastSettings', this.gamecastDetails, {"id": `${this.gamecastDetails.id}`});
	}

	setCheckbox($event:any) {
		let val:boolean = $event.detail.checked;
		this.gamecastDetails.resetTimeoutsEveryPeriod = val ? 1 : 0;
	}
}
