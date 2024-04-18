import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject, input, output } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Game } from 'src/app/types/models';
import { ChangePeriodTotalsConfig } from 'src/app/services/gamecast/gamecast.service';

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
	public game = input.required<Game>();
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
			this.firstPeriodPoints = game.homePointsQ1;
			this.secondPeriodPoints = game.homePointsQ2;
			this.thirdPeriodPoints = game.homePointsQ3;
			this.fourthPeriodPoints = game.homePointsQ4;
			this.overtimePoints = game.homePointsOT;
		}
		else {
			this.firstPeriodPoints = game.awayPointsQ1;
			this.secondPeriodPoints = game.awayPointsQ2;
			this.thirdPeriodPoints = game.awayPointsQ3;
			this.fourthPeriodPoints = game.awayPointsQ4;
			this.overtimePoints = game.awayPointsOT;
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
