import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { Game } from 'src/app/interfaces/game.interface';

import { CommonService } from 'src/app/services/common/common.service';

@Component({
  selector: 'app-games',
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.scss']
})
export class GamesComponent {
  public games$?: Observable<Game[]>;
  public filteredGames: Game[] = [];
  public filterEvent: string = '';

  constructor(private common: CommonService, private router: Router) {}

  ngOnInit() {
    this.common.gameState().subscribe(ready => {
      if (ready) {
        this.common.getGames().subscribe(games => {
          this.filteredGames = games.sort((a, b) => new Date(b.gameDate).getTime() - new Date(a.gameDate).getTime());
        });
        
        
      }
    });
  }


  navigateToGamecast(gameId: number) {
    this.router.navigate(['/gamecast', gameId]);
  }
}
