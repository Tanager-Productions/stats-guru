import { Injectable } from '@angular/core';
import { Game, Player, Stat } from 'src/app/interfaces/models';

@Injectable({
  providedIn: 'root'
})
export class GamecastService {
	private players!: Player[];
	private stats!: Stat[];
	private game!: Game;

  constructor() { }

	public send() {

	}
}
