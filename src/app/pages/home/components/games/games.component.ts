import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Game } from 'src/app/interfaces/game.interface';
import { ApiService } from 'src/app/services/api/api.service';
import { CommonService } from 'src/app/services/common/common.service';
import { Logo } from 'src/app/types/logo.type';

@Component({
  selector: 'app-games',
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.scss'],
})
export class GamesComponent implements OnInit {
  public games$?: Observable<Game[]>;
  public logos: Logo[] = []


  constructor(private common: CommonService, private router: Router, private apiService: ApiService) {}

  async ngOnInit() {
    await this.initCommon();
    this.common.gameState().subscribe(ready => {
      if (ready) {
        this.games$ = this.common.getGames();
        this.apiService.getLogos().subscribe(logos => {
          this.logos = logos;
        });
      }
    })
  }
  

  public async initCommon() {
    await this.common.initializeService();
  }

  navigateToAddGame() {
    this.router.navigateByUrl('/add-game');
  }

  navigateToGamecast(gameId: number) {
    this.router.navigateByUrl(`/gamecast/${gameId}`);
  }

  public getLogo(teamName: string): string {
    const logo = this.logos.find(l => l.team.toLowerCase() === teamName.toLowerCase());
    console.log('teamName:', teamName, 'logo:', logo);
    return logo ? logo.src : '';
  }


}