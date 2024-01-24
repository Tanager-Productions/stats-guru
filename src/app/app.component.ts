import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
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
	public auth = inject(AuthService);
}
