import { Component, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CrudService } from 'src/app/services/crud/crud.service';
import { SqlService } from 'src/app/services/sql/sql.service';

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
		private route: ActivatedRoute,
		private crud: CrudService,
		private sql: SqlService) {}
}
