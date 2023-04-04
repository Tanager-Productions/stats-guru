import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SqlService } from './services/sql/sql.service';
import { version1 } from './upgrades/version1';
import { SyncService } from './services/sync/sync.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(platform: Platform, sqlite:SqlService) {
    platform.ready().then(async () => {
      let ret = await sqlite.initializePlugin();
      console.log(`>>>>>>>> sqlite initialized: ${ret}`);
      await sqlite.addUpgradeStatement("tgs", 1, version1);
      console.log("Upgrade finished");
      let res = await sqlite.echo("Are you there?");
      console.log(res);
    });
  }
}
