import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Game } from 'src/app/interfaces/game.interface';
import { CommonService } from 'src/app/services/common/common.service';

@Component({
  selector: 'app-games',
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.scss'],
})
export class GamesComponent implements OnInit {
  public games$?: Observable<Game[]>;
  filteredGames: Game[] = [];
  searchQuery: string = '';

  constructor(private common: CommonService, private router: Router) {}

  async ngOnInit() {
    await this.initCommon();
    this.common.gameState().subscribe(ready => {
      if (ready) {
        this.games$ = this.common.getGames();
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
  
}