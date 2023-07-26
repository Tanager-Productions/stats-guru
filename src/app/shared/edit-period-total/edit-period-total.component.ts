import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GamecastComponent } from 'src/app/pages/home/components/gamecast/gamecast.component';

@Component({
  selector: 'app-edit-period-total',
  templateUrl: './edit-period-total.component.html',
  styleUrls: ['./edit-period-total.component.scss']
})
export class EditPeriodTotalComponent {
	@Input() team!: 'home' | 'away';
	@Input() teamName!:string;
	@Input() isMale!:number;
	@Input() firstPeriodPoints!: number;
	@Input() secondPeriodPoints!: number;
	@Input() thirdPeriodPoints!: number;
	@Input() fourthPeriodPoints!: number;
	@Input() overtimePoints!: number;
	@Output() dismiss: EventEmitter<void> = new EventEmitter();
	@Input() color!:string;
	homePoints!: number;
	awayPoints!:number;

	constructor(
		private gamecastComponent: GamecastComponent
	) {}

	ngOnInit() {
		this.getPoints();
	}

	getPoints() {
		if (this.team == 'home') {
			this.firstPeriodPoints = this.gamecastComponent.currentGame!.homePointsQ1;
			this.secondPeriodPoints = this.gamecastComponent.currentGame!.homePointsQ2;
			this.thirdPeriodPoints = this.gamecastComponent.currentGame!.homePointsQ3;
			this.fourthPeriodPoints = this.gamecastComponent.currentGame!.homePointsQ4;
			this.overtimePoints = this.gamecastComponent.currentGame!.homePointsOT;

		}
		else {
			this.firstPeriodPoints = this.gamecastComponent.currentGame!.awayPointsQ1;
			this.secondPeriodPoints = this.gamecastComponent.currentGame!.awayPointsQ2;
			this.thirdPeriodPoints = this.gamecastComponent.currentGame!.awayPointsQ3;
			this.fourthPeriodPoints = this.gamecastComponent.currentGame!.awayPointsQ4;
			this.overtimePoints = this.gamecastComponent.currentGame!.awayPointsOT;
		}
	}

	async submitPoints() {
		if (this.team == 'home') {
			this.gamecastComponent.currentGame!.homePointsQ1 = this.firstPeriodPoints;
			this.gamecastComponent.currentGame!.homePointsQ2 = this.secondPeriodPoints;
			this.gamecastComponent.currentGame!.homePointsQ3 = this.thirdPeriodPoints;
			this.gamecastComponent.currentGame!.homePointsQ4 = this.fourthPeriodPoints;
			this.gamecastComponent.currentGame!.homePointsOT = this.overtimePoints;
			this.homePoints =
				this.firstPeriodPoints +
				this.secondPeriodPoints +
				this.thirdPeriodPoints +
				this.fourthPeriodPoints +
				this.overtimePoints
			this.gamecastComponent.currentGame!.homeFinal = this.homePoints;
		}
		else {
			this.gamecastComponent.currentGame!.awayPointsQ1 = this.firstPeriodPoints;
			this.gamecastComponent.currentGame!.awayPointsQ2 = this.secondPeriodPoints;
			this.gamecastComponent.currentGame!.awayPointsQ3 = this.thirdPeriodPoints;
			this.gamecastComponent.currentGame!.awayPointsQ4 = this.fourthPeriodPoints;
			this.gamecastComponent.currentGame!.awayPointsOT = this.overtimePoints;
			this.awayPoints =
				this.firstPeriodPoints +
				this.secondPeriodPoints +
				this.thirdPeriodPoints +
				this.fourthPeriodPoints +
				this.overtimePoints
			this.gamecastComponent.currentGame!.awayFinal = this.awayPoints;
		}

		await this.gamecastComponent.updateGame();
		this.dismiss.emit();
	}
}
