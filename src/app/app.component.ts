import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterOutlet } from '@angular/router';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	standalone: true,
	imports: [IonicModule, RouterOutlet]
})
export class AppComponent {

}
