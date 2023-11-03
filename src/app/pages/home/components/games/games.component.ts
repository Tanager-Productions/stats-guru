import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Game, Event } from 'src/app/interfaces/models';
import { CommonService } from 'src/app/services/common/common.service';
import { SqlService } from 'src/app/services/sql/sql.service';
import { SyncService } from 'src/app/services/sync/sync.service';

@Component({
  selector: 'app-games',
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.scss'],
})
export class GamesComponent implements OnInit {
  public games?: {
		gameId:number,
		gameDate:string,
		homeTeamName:string,
		awayTeamName:string,
		homeTeamLogo:string|null,
		awayTeamLogo:string|null,
		eventId:number|null
	}[];
  public events?: Event[];
  filterEventId:number = 0;

  constructor(private sql:SqlService, private sync:SyncService) {}

  ngOnInit() {
		this.sql.isReady().subscribe(async ready => {
			if (ready) {
				if (this.sync.online) {
					await this.sync.beginSync(true);
				}

				this.games = await this.sql.rawQuery(`
					SELECT
						g.id as gameId,
						g.gameDate,
						g.eventId,
						homeTeam.name AS homeTeamName,
						awayTeam.name AS awayTeamName,
						homeTeam.defaultLogo AS homeTeamLogo,
						awayTeam.defaultLogo AS awayTeamLogo
					FROM
						Games g
					JOIN
						Teams AS homeTeam ON g.homeTeamId = homeTeam.id
					JOIN
						Teams AS awayTeam ON g.awayTeamId = awayTeam.id
					ORDER BY
						g.gameDate DESC;
				`);
			}
		});
  }
}
