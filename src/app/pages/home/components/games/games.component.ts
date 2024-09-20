import { ChangeDetectionStrategy, Component, effect, inject, untracked, viewChild } from '@angular/core';
import { CommonService, HomePageGame } from 'src/app/services/common/common.service';
import { SyncService } from 'src/app/services/sync/sync.service';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { AddGamesComponent } from '../../../../shared/add-games/add-games.component';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AgGridAngular, AgGridModule } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, fromEvent } from 'rxjs';
import { ApiService } from 'src/app/services/api/api.service';

@Component({
	selector: 'app-games',
	templateUrl: './games.component.html',
	styleUrls: ['./games.component.scss'],
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		IonicModule,
		FormsModule,
		AddGamesComponent,
		RouterLink,
		DatePipe,
		AgGridModule,
	],
})
export class GamesComponent {
	private server = inject(ApiService)
	private sync = inject(SyncService);
	public common = inject(CommonService);
	private router = inject(Router);
	public grid = viewChild(AgGridAngular);
	public filterEventId: number | null = 0;
	public gameStats: ColDef<HomePageGame>[] = [
		{ field: 'gameDay', headerName: 'Date' },
		{ field: 'gameDate', headerName: 'Date' },
		{ field: 'homeTeamName', headerName: 'Home Team' },
		{ field: 'homeTeamScore', headerName: 'Score' },
		{ field: 'awayTeamName', headerName: 'Home Team' },
		{ field: 'awayTeamScore', headerName: 'Score' },
	]

	public windowResize = toSignal(fromEvent(window, 'resize').pipe(
		debounceTime(200),
		distinctUntilChanged()
	));

	private windowResizeEffect = effect(() => {
		this.windowResize();
		const grid = untracked(this.grid);
		grid?.api.sizeColumnsToFit();
	})

	public gridOption = {
		onRowClicked: (event: any) => this.routeToPage(event)
	}

	async ngOnInit() {
		if (this.server.isOnline()) {
			await this.sync.beginSync(true);
		} else {
			this.common.initializeService();
		}
	}

	public setData() {
		if (this.filterEventId != 0) {
			return this.common.homePageGames().filter(t => t.eventId == this.filterEventId);
		} else {
			return this.common.homePageGames();
		}
	}

	public routeToPage(event: any) {
		if (event.node.selected) {
			this.router.navigateByUrl("/home/gamecast/" + event.data.gameId);
		}
	}
}
