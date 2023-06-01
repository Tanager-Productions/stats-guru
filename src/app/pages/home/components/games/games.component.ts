import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InfiniteScrollCustomEvent, PopoverController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Game } from 'src/app/interfaces/game.interface';
import { ApiService } from 'src/app/services/api/api.service';
import { CommonService } from 'src/app/services/common/common.service';
import { Logo } from 'src/app/types/logo.type';
import { Team } from 'src/app/interfaces/team.interface';
import { CrudService } from 'src/app/services/crud/crud.service';
import { SqlService } from 'src/app/services/sql/sql.service';

@Component({
  selector: 'app-games',
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.scss'],
})
export class GamesComponent implements OnInit {
  public games$?: Observable<Game[]>;
  public feed: Game[] = [];
  public gamesList: Game[] = [];
  private gameCount: number = 15;
  public logos: {name:string, isMale:boolean, logo:string}[] = [];


  constructor(private common: CommonService, private router: Router, private apiService: ApiService, private crud: CrudService, private sql:SqlService) {}

  async ngOnInit() {
    await this.initCommon();
    this.common.gameState().subscribe(ready => {
      if (ready) {
        this.games$ = this.common.getGames();
        this.games$.subscribe(games => {
          this.gamesList = games;
          this.feed.push(...this.gamesList.slice(0, this.gameCount-1));
        });
      }
    });
    let db = await this.sql.createConnection();
    await db.open();
    this.logos = await this.crud.rawQuery(db, 'select Teams.name, Teams.isMale, Teams.logo from Teams;');
    await db.close();
    console.log(this.logos);
  }

  public getLogo(teamName:string, isMale:boolean) {
    return this.logos.find(t => t.name == teamName && t.isMale == isMale)?.logo;
  }

  private async refresh() {
    this.feed = [];
    this.gameCount = 15;
    this.feed.push(...this.gamesList.slice(0, this.gameCount-1));
  }

  onIonInfinite(ev:any) {
    setTimeout(() => {
      if (this.feed.length < this.gamesList.length) {
        let end = this.gameCount+14;
        if (this.gameCount > this.gamesList.length)
          end = this.gamesList.length-1;
        this.feed.push(...this.gamesList.slice(this.gameCount, end));
        this.gameCount += 15;
      }
      (ev as InfiniteScrollCustomEvent).target.complete();
    }, 1000);
  }

  public async initCommon() {
    await this.common.initializeService();
    this.refresh();
  }

  navigateToAddGame() {
    this.router.navigateByUrl('/add-game');
  }

  navigateToGamecast(gameId: number) {
    this.router.navigateByUrl(`/gamecast/${gameId}`);
  }


}
