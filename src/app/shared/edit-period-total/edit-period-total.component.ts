import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ChangePeriodTotalsConfig } from 'src/app/pages/gamecast/service/gamecast.service';
import { Game, SyncState } from 'src/app/app.types';

@Component({
	selector: 'app-edit-period-total',
	templateUrl: './edit-period-total.component.html',
	styleUrls: ['./edit-period-total.component.scss'],
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [IonicModule, FormsModule]
})
export class EditPeriodTotalComponent {
	public team = input.required<'home' | 'away'>();
	public color = input.required<string>();
	public game = input.required<Game & { sync_state: SyncState }>();
	public update = output<ChangePeriodTotalsConfig>();
	protected firstPeriodPoints!: number;
	protected secondPeriodPoints!: number;
	protected thirdPeriodPoints!: number;
	protected fourthPeriodPoints!: number;
	protected overtimePoints!: number;
	protected modalCtrl = inject(ModalController);

	ngOnInit() {
		const game = this.game();
		if (this.team() == 'home') {
			this.firstPeriodPoints = game.home_points_q1;
			this.secondPeriodPoints = game.home_points_q2;
			this.thirdPeriodPoints = game.home_points_q3;
			this.fourthPeriodPoints = game.home_points_q4;
			this.overtimePoints = game.home_points_ot;
		}
		else {
			this.firstPeriodPoints = game.away_points_q1;
			this.secondPeriodPoints = game.away_points_q2;
			this.thirdPeriodPoints = game.away_points_q3;
			this.fourthPeriodPoints = game.away_points_q4;
			this.overtimePoints = game.away_points_ot;
		}
	}

	async submitPoints() {
		this.update.emit({
			team: this.team(),
			totals: {
				p1: this.firstPeriodPoints,
				p2: this.secondPeriodPoints,
				p3: this.thirdPeriodPoints,
				p4: this.fourthPeriodPoints,
				ot: this.overtimePoints
			}
		});
		this.modalCtrl.dismiss();
	}
}
