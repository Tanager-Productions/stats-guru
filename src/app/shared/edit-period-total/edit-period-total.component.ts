import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Game } from 'src/app/types/models';
import { ChangePeriodTotalsConfig } from 'src/app/services/gamecast/gamecast.service';

@Component({
	selector: 'app-edit-period-total',
	templateUrl: './edit-period-total.component.html',
	styleUrls: ['./edit-period-total.component.scss'],
	standalone: true,
	imports: [IonicModule, FormsModule]
})
export class EditPeriodTotalComponent {
	@Input({ required: true }) team!: 'home' | 'away';
	@Input({ required: true }) color!:string;
	@Input({ required: true }) game!: Game;
	@Output() update = new EventEmitter<ChangePeriodTotalsConfig>()
	protected firstPeriodPoints!: number;
	protected secondPeriodPoints!: number;
	protected thirdPeriodPoints!: number;
	protected fourthPeriodPoints!: number;
	protected overtimePoints!: number;
	protected modalCtrl = inject(ModalController);

	ngOnInit() {
		if (this.team == 'home') {
			this.firstPeriodPoints = this.game.homePointsQ1;
			this.secondPeriodPoints = this.game.homePointsQ2;
			this.thirdPeriodPoints = this.game.homePointsQ3;
			this.fourthPeriodPoints = this.game.homePointsQ4;
			this.overtimePoints = this.game.homePointsOT;
		}
		else {
			this.firstPeriodPoints = this.game.awayPointsQ1;
			this.secondPeriodPoints = this.game.awayPointsQ2;
			this.thirdPeriodPoints = this.game.awayPointsQ3;
			this.fourthPeriodPoints = this.game.awayPointsQ4;
			this.overtimePoints = this.game.awayPointsOT;
		}
	}

	async submitPoints() {
		this.update.emit({
			team: this.team,
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
