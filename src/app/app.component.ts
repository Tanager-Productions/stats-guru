import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SqlService } from './services/sql/sql.service';
import { AuthService } from './services/auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(platform: Platform, sqlite:SqlService, public auth:AuthService) {
    platform.ready().then(async () => {
      await sqlite.initializePlugin();
      await sqlite.upgradeDatabase();
    });
  }
}
