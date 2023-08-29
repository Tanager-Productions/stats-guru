import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Player } from 'src/app/interfaces/player.interface';

@Component({
  selector: 'app-edit-player',
  templateUrl: './edit-player.component.html',
  styleUrls: ['./edit-player.component.scss']
})
export class EditPlayerComponent {
	@Input() player!:Player;
	@Input() color!:string;
	editPlayer:boolean = false;
	@Output() savePlayer: EventEmitter<void> = new EventEmitter();
}
