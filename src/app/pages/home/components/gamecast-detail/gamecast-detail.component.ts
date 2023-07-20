import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { GameCastSettings } from 'src/app/interfaces/gameCastSetting.interface';
import { CrudService } from 'src/app/services/crud/crud.service';
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
	db!: SQLiteDBConnection;

	constructor(private crud: CrudService, private sql: SqlService) {}

	async ngOnInit() {
		this.db = await this.sql.createConnection();
		this.gamecastDetails = (await this.crud.rawQuery(this.db, `select * from gameCastSettings where game = '${this.gameId}'`))[0];
	}

	async save() {
		await this.crud.save(this.db, 'gameCastSettings', this.gamecastDetails, {"id": `${this.gamecastDetails.id}`});
	}

	setCheckbox($event:any) {
		let val:boolean = $event.detail.checked;
		this.gamecastDetails.resetTimeoutsEveryPeriod = val ? 1 : 0;
	}
}
