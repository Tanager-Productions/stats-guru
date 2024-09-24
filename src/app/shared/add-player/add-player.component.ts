import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Stat, Player, SyncState } from 'src/app/app.types';
import { defaultPlayer } from 'src/app/app.utils';

@Component({
	selector: 'app-add-player',
	templateUrl: './add-player.component.html',
	styleUrls: ['./add-player.component.scss'],
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [IonicModule, FormsModule]
})
export class AddPlayerComponent {
	protected tab: "add" | "hide" = "add";
	protected newPlayerNumber: string = '0';
	protected newPlayerFirstName!: string;
	protected newPlayerLastName!: string;
	public teamId = input.required<number>();
	public isMale = input.required<boolean>();
	public stats = input.required<(Stat & { sync_state: SyncState })[]>();
	public color = input.required<string>();
	public players = input.required<(Player & { sync_state: SyncState })[]>();
	public dismiss = output();
	public playerAdded = output<Player & { sync_state: SyncState }>();
	public playerHiddenChanged = output<Player & { sync_state: SyncState }>();
	public mapping = computed(() => {
		const players = this.players();
		const stats = this.stats();
		return players.map(player => {
			const stat = stats.find(t => t.player_id == player.sync_id);
			return { stat, player };
		})
	});

	public addToTeam() {
		this.playerAdded.emit({
			...defaultPlayer(),
			sync_state: SyncState.Added,
			first_name: this.newPlayerFirstName,
			last_name: this.newPlayerLastName,
			number: this.newPlayerNumber,
			team_id: this.teamId(),
			is_male: this.isMale()
		});
		this.dismiss.emit();
	}
}
