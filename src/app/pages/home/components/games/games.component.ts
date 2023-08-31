import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Event } from 'src/app/interfaces/event.interface';
import { Game } from 'src/app/interfaces/game.interface';
import { CommonService } from 'src/app/services/common/common.service';
import { SqlService } from 'src/app/services/sql/sql.service';
import { SyncService } from 'src/app/services/sync/sync.service';

@Component({
  selector: 'app-games',
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.scss'],
})
export class GamesComponent implements OnInit {
  public games?: Game[];
  public events?: Event[];
  public logos?: {name:string, isMale:number, logo:string|null}[];
  filterEventId:number = 0;

  constructor(private common: CommonService,
    					private router: Router,
    					private sql:SqlService,
    					private sync:SyncService) {}

  ngOnInit() {
		this.sql.isReady().subscribe(ready => {
			if (ready) {
				if (this.sync.online) {
					this.sync.beginSync(true);
				} else {
					this.common.initializeService();
				}
			}
		});
		this.common.getGames().subscribe(async games => {
			if (games != null) {
        this.games = games;
        this.logos = await this.sql.rawQuery('select teams.name, teams.isMale, teams.logo from teams;');
			}
		});
    this.common.getEvents().subscribe(events => {
      if (events != null) {
        this.events = events;
      }
    });
  }

  public getLogo(teamName:string, isMale:number) {
    let item = this.logos?.find(t => t.name == teamName && t.isMale == isMale)!;
    if (item.logo == null) {
      return '../../../../assets/icon-black.png'
    } else {
      return item.logo;
    }
  }
}
