import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Game } from 'src/app/types/models';

@Component({
	selector: 'app-edit-period-total',
	templateUrl: './edit-period-total.component.html',
	styleUrls: ['./edit-period-total.component.scss'],
	standalone: true,
	imports: [NgIf, IonicModule, FormsModule]
})
export class EditPeriodTotalComponent {
	@Input() team!: 'home' | 'away';
	@Input() color!:string;
	@Input() game!: Game;
	public firstPeriodPoints!: number;
	public secondPeriodPoints!: number;
	public thirdPeriodPoints!: number;
	public fourthPeriodPoints!: number;
	public overtimePoints!: number;
	@Output() update = new EventEmitter<void>()

	constructor(public modalCtrl: ModalController) {}

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
		if (this.team == 'home') {
			this.game.homePointsQ1 = this.firstPeriodPoints;
			this.game.homePointsQ2 = this.secondPeriodPoints;
			this.game.homePointsQ3 = this.thirdPeriodPoints;
			this.game.homePointsQ4 = this.fourthPeriodPoints;
			this.game.homePointsOT = this.overtimePoints;
			this.game.homeFinal =
				this.firstPeriodPoints +
				this.secondPeriodPoints +
				this.thirdPeriodPoints +
				this.fourthPeriodPoints +
				this.overtimePoints;
		}
		else {
			this.game.awayPointsQ1 = this.firstPeriodPoints;
			this.game.awayPointsQ2 = this.secondPeriodPoints;
			this.game.awayPointsQ3 = this.thirdPeriodPoints;
			this.game.awayPointsQ4 = this.fourthPeriodPoints;
			this.game.awayPointsOT = this.overtimePoints;
			this.game.awayFinal =
				this.firstPeriodPoints +
				this.secondPeriodPoints +
				this.thirdPeriodPoints +
				this.fourthPeriodPoints +
				this.overtimePoints;
		}

		this.update.emit();
		this.modalCtrl.dismiss();
	}
}
