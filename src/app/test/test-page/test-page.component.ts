import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Game } from 'src/app/interfaces/game.interface';
import { CommonService } from 'src/app/services/common/common.service';
import { SyncService } from 'src/app/services/sync/sync.service';

@Component({
  selector: 'app-test-page',
  templateUrl: './test-page.component.html',
  styleUrls: ['./test-page.component.scss']
})
export class TestPageComponent implements OnInit {
  public games$?: Observable<Game[]>;

  constructor(private common:CommonService, private sync:SyncService) {}

  async ngOnInit() {
    this.common.gameState().subscribe(ready => {
      console.log("Games state emitted: ", ready);
      if (ready) {
        this.games$ = this.common.getGames();
      }
    })
  }

  public async initCommon() {
    await this.common.initializeService();
  }

  public async test() {
    await this.sync.beginSync();
  }
}
