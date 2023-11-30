import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonService } from 'src/app/services/common/common.service';
import { SqlService } from 'src/app/services/sql/sql.service';
import { SyncService } from 'src/app/services/sync/sync.service';
import { RouterLink } from '@angular/router';
import { AddGamesComponent } from '../../../../shared/add-games/add-games.component';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
	selector: 'app-games',
	templateUrl: './games.component.html',
	styleUrls: ['./games.component.scss'],
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		IonicModule,
		FormsModule,
		NgFor,
		AddGamesComponent,
		NgIf,
		RouterLink,
		DatePipe,
	],
})
export class GamesComponent {
	private sql = inject(SqlService);
	private sync = inject(SyncService);
	public common = inject(CommonService);
  public filterEventId:number|null = 0;

  ngOnInit() {
		this.sql.isReady().subscribe(async ready => {
			if (ready) {
				if (this.sync.online) {
					await this.sync.beginSync(true);
				} else {
					this.common.initializeService();
				}
			}
		});
  }
}
