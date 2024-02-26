import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Player } from 'src/app/types/models';

@Component({
	selector: 'app-edit-player',
	templateUrl: './edit-player.component.html',
	styleUrls: ['./edit-player.component.scss'],
	standalone: true,
	imports: [IonicModule, FormsModule, NgIf]
})
export class EditPlayerComponent {
	@Input() player!: Player;
	@Input() color!: string;
	editPlayer: boolean = false;
	@Output() savePlayer: EventEmitter<void> = new EventEmitter();
}
