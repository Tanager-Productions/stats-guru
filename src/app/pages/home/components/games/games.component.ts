import { Component, OnInit } from '@angular/core';
import { Event } from 'src/app/interfaces/models';
import { CommonService, HomePageGame } from 'src/app/services/common/common.service';
import { SqlService } from 'src/app/services/sql/sql.service';
import { SyncService } from 'src/app/services/sync/sync.service';

@Component({
  selector: 'app-games',
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.scss'],
})
export class GamesComponent implements OnInit {
  public games?: HomePageGame[];
  public events?: Event[];
  filterEventId:number = 0;

  constructor(private sql:SqlService, private sync:SyncService, private common:CommonService) {}

  ngOnInit() {
		this.sql.isReady().subscribe(async ready => {
			if (ready) {
				if (this.sync.online) {
					await this.sync.beginSync(true);
				} else {
					this.common.initializeService();
				}

				this.common.getGames().subscribe(games => {
					if (games != null) {
						this.games = games;
					}
				});

				this.common.getEvents().subscribe(events => {
					if (events != null) {
						this.events = events;
					}
				});
			}
		});
  }
}
