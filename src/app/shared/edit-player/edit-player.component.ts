import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Player } from 'src/app/types/models';

@Component({
	selector: 'app-edit-player',
	templateUrl: './edit-player.component.html',
	styleUrls: ['./edit-player.component.scss'],
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [IonicModule, FormsModule]
})
export class EditPlayerComponent {
	public player = input.required<Player>();
	protected editPlayer = false;
	public savePlayer = output();
}
