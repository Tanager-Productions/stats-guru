import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Game } from 'src/app/interfaces/game.interface';
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
  public logos: {name:string, isMale:boolean, logo:string}[] = [];

  constructor(
    private common: CommonService,
    private router: Router,
    private sync:SyncService,
    private crud: CrudService,
    private sql:SqlService
  ) {

  }

  ngOnInit() {
    this.sync.syncComplete().subscribe(async complete => {
      if (complete) {
        this.common.gameState().subscribe(async ready => {
          if (ready) {
            this.games$ = this.common.getGames();
            let db = await this.sql.createConnection();
            this.logos = await this.crud.rawQuery(db, 'select Teams.name, Teams.isMale, Teams.logo from Teams;');
          }
        });
      }
    });
  }

  public getLogo(teamName:string, isMale:boolean) {
    return this.logos.find(t => t.name == teamName && t.isMale == isMale)?.logo;
  }

  navigateToAddGame() {
    this.router.navigateByUrl('/add-game');
  }

  navigateToGamecast(gameId: number) {
    this.router.navigateByUrl(`/gamecast/${gameId}`);
  }


}
