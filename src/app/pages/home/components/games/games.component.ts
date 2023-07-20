import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Event } from 'src/app/interfaces/event.interface';
import { Game } from 'src/app/interfaces/game.interface';
import { ApiService } from 'src/app/services/api/api.service';
import { CommonService } from 'src/app/services/common/common.service';
import { CrudService } from 'src/app/services/crud/crud.service';
import { SqlService } from 'src/app/services/sql/sql.service';
import { SyncService } from 'src/app/services/sync/sync.service';

@Component({
  selector: 'app-games',
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.scss'],
})
export class GamesComponent implements OnInit {
  public games$?: Observable<Game[]>;
  public events$?: Observable<Event[]>;
  public logos?: {name:string, isMale:string, logo:string|null}[];
  filterEventId:number = 0;

  constructor(
    private common: CommonService,
    private router: Router,
    private crud: CrudService,
    private sql:SqlService,
    sync:SyncService
  ) {
		if (sync.online) {
			sync.beginSync(true);
		} else {
			this.common.initializeService();
		}
  }

  ngOnInit() {
    this.common.gameState().subscribe(async ready => {
      if (ready) {
        this.games$ = this.common.getGames();
        let db = await this.sql.createConnection();
        this.logos = await this.crud.rawQuery(db, 'select Teams.name, Teams.isMale, Teams.logo from Teams;');
      }
    });
    this.common.eventState().subscribe(ready => {
      if (ready) {
        this.events$ = this.common.getEvents();
      }
    });
  }

  public getLogo(teamName:string, isMale:string) {
    let item = this.logos?.find(t => t.name == teamName && t.isMale == isMale)!;
    if (item.logo == null) {
      return '../../../../assets/icon-black.png'
    } else {
      return item.logo;
    }
  }

  navigateToAddGame() {
    this.router.navigateByUrl('/add-game');
  }

  navigateToGamecast(gameId: string) {
    this.router.navigateByUrl(`/gamecast/${gameId}`);
  }


}
