import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Player, Stat, SyncState } from 'src/app/types/models';
import { defaultPlayer } from '@tanager/tgs';

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
	protected newPlayerNumber: number = 0;
	protected newPlayerFirstName!: string;
	protected newPlayerLastName!: string;
	public teamId = input.required<number>();
	public isMale = input.required<boolean>();
	public stats = input.required<Stat[]>();
	public color = input.required<string>();
	public players = input.required<Player[]>();
	public dismiss = output();
	public playerAdded = output<Player>();
	public playerHiddenChanged = output<Player>();
	public mapping = computed(() => {
		const players = this.players();
		const stats = this.stats();
		return players.map(player => {
			const stat = stats.find(t => t.playerId == player.id);
			return { stat, player };
		})
	});

	public addToTeam() {
		this.playerAdded.emit({
			...defaultPlayer,
			syncState: SyncState.Added,
			firstName: this.newPlayerFirstName,
			lastName: this.newPlayerLastName,
			number: this.newPlayerNumber,
			teamId: this.teamId(),
			isMale: this.isMale()
		});
		this.dismiss.emit();
	}
}
