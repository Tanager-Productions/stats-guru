import { Component, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Player } from 'src/app/interfaces/player.interface';
import { SyncState } from 'src/app/interfaces/syncState.enum';
import { CrudService } from 'src/app/services/crud/crud.service';
import { SqlService } from 'src/app/services/sql/sql.service';

@Component({
  selector: 'app-add-home-player',
  templateUrl: './add-home-player.component.html',
  styleUrls: ['./add-home-player.component.scss']
})
export class AddHomePlayerComponent {
	newPlayerNumber!: number;
	newPlayerFirstName!: string;
	newPlayerLastName!: string;
	gameId: number | undefined;
	@Output() dismiss: EventEmitter<void> = new EventEmitter();

	constructor(
		private route: ActivatedRoute,
		private crud: CrudService,
		private sql: SqlService) {}

}
