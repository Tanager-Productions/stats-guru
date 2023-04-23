import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Game } from 'src/app/interfaces/game.interface';

@Component({
  selector: 'app-gamecast',
  templateUrl: './gamecast.component.html',
  styleUrls: ['./gamecast.component.scss']
})
export class GamecastComponent {
  gameId: number | undefined;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe((params: { [x: string]: string | number; }) => {
      this.gameId = +params['gameId'];
    });
  }
}