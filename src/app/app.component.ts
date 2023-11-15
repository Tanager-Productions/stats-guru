import { Component } from '@angular/core';
import { Platform, IonicModule } from '@ionic/angular';
import { SqlService } from './services/sql/sql.service';
import { AuthService } from './services/auth/auth.service';
import { HeaderComponent } from './shared/header/header.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: true,
    imports: [IonicModule, HeaderComponent]
})
export class AppComponent {
  constructor(sqlite:SqlService, public auth:AuthService) {
    sqlite.init();
  }
}
