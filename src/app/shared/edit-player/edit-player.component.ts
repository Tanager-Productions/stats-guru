import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Player, Stat } from 'src/app/types/models';
import { GamecastService } from 'src/app/services/gamecast/gamecast.service';
@Component({
	selector: 'app-edit-player',
	templateUrl: './edit-player.component.html',
	styleUrls: ['./edit-player.component.scss'],
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [IonicModule, FormsModule]
})
export class EditPlayerComponent {
	protected dataService = inject(GamecastService);

	public player = input.required<Player>();
	protected editPlayer = false;
	public savePlayer = output();
	public stat = model<Stat>();

	public updateTemporaryPlayerNumber(player: Player, $event: any | undefined) {
		this.dataService.updateStat({
			player: player,
			updateFn: stat => stat.playerNumber = $event
		});
	}
}
