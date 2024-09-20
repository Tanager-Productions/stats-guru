import { ChangeDetectionStrategy, Component, WritableSignal, effect, inject, model, signal, untracked } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription, interval, lastValueFrom } from 'rxjs';
import { CellEditingStoppedEvent, ColDef } from 'ag-grid-community';
import { ApiService } from 'src/app/services/api/api.service';
import { SyncService } from 'src/app/services/sync/sync.service';
import { EditPeriodTotalComponent } from '../../../../shared/edit-period-total/edit-period-total.component';
import { AddPlayerComponent } from '../../../../shared/add-player/add-player.component';
import { AgGridModule } from 'ag-grid-angular';
import { GamecastDetailComponent } from '../../../../shared/gamecast-detail/gamecast-detail.component';
import { FormsModule } from '@angular/forms';
import { EditPlayerComponent } from '../../../../shared/edit-player/edit-player.component';
import { NgClass, SlicePipe, DatePipe } from '@angular/common';
import { InputChangeEventDetail, IonPopover, IonicModule } from '@ionic/angular';
import { IonInputCustomEvent } from '@ionic/core';
import { BoxScore, GamecastService } from 'src/app/services/gamecast/gamecast.service';
import { GAME_ACTIONS_MAP, GameActions, Play, Player, SyncState } from 'src/app/app.types';

type AutoComplete = 'rebound' | 'assist' | 'missed' | 'turnover' | null;

@Component({
	selector: 'app-gamecast',
	templateUrl: './gamecast.component.html',
	styleUrls: ['./gamecast.component.scss'],
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		IonicModule,
		RouterLink,
		EditPlayerComponent,
		NgClass,
		FormsModule,
		GamecastDetailComponent,
		AgGridModule,
		AddPlayerComponent,
		EditPeriodTotalComponent,
		SlicePipe,
		DatePipe
	],
	host: { class: 'page' },
})
export class GamecastComponent {
	//inject
	private route = inject(ActivatedRoute);
	private api = inject(ApiService);
	protected sync = inject(SyncService);
	protected dataService = inject(GamecastService);

	//config
	public fontSize = 16;
	private gameId!:number;
  private timerSubscription?: Subscription;
  private timerDuration!: number;
  public timerRunning: boolean = false;
	private initSub?:Subscription;
	public actions = GAME_ACTIONS_MAP;
	public sendingLogs = false;
	public homeColor = model('blue');
	public awayColor = model('red');
	public missedColor = model('missed');
	public colorTeam: 'home' | 'away' = 'home';
	public clock = model("00:00");
	private clockEffect = effect(() => {
		const clock = this.clock();
		const game = untracked(this.dataService.game);
		if (game) {
			game.clock = clock;
		}
	})

	//boxscore modal
	public statsTab: 'home' | 'away' = 'home';
	public teamStats: ColDef<BoxScore>[] = [
		{field: 'number', headerName: 'NUM', pinned: true, editable: false, width: 110},
		{field: 'name', editable: false, pinned: true},
		{field: 'points', headerName: 'PTS', width: 80, editable: false},
		{field: 'rebounds', headerName: 'REB', width: 80, editable: false},
		{field: 'assists', headerName: 'AST', width: 80},
		{field: 'steals', headerName: 'STL', width: 80},
		{field: 'blocks', headerName: 'BLK', width: 80},
		{field: 'field_goals_made', headerName: 'FGM', width: 90},
		{field: 'field_goals_attempted', headerName: 'FGA', width: 80},
		{field: 'threes_made', headerName: '3FGM', width: 90},
		{field: 'threes_attempted', headerName: '3FGA', width: 90},
		{field: 'free_throws_made', headerName: 'FTM', width: 80},
		{field: 'free_throws_attempted', headerName: 'FTA', width: 80},
		{field: 'offensive_rebounds', headerName: 'OREB', width: 90},
		{field: 'defensive_rebounds', headerName: 'DREB', width: 90},
		{field: 'turnovers', headerName: 'TO', width: 80},
		{field: 'fouls', headerName: 'FOUL', width: 90},
		{field: 'plus_or_minus', headerName: '+/-', width: 80},
	];

	//Displaying Auto-Complete Options:
	private previousPlayerWasHome = false;
	public autocomplete: WritableSignal<AutoComplete> = signal(null);
	public currentPlayersOnCourt: WritableSignal<Player[] | null> = signal(null);
	public sixthPlayer: WritableSignal<Player | null> = signal(null);
	public showPlayers: WritableSignal<boolean> = signal(true);
	private autocompleteEffect = effect(() => {
		const selectedPlayer = this.dataService.selectedPlayer();
		const autocomplete = untracked(this.autocomplete);
		if (selectedPlayer && autocomplete) {
			const game = untracked(this.dataService.game);
			let team: 'home' | 'away' = 'away';
			if (selectedPlayer.team_id === game?.home_team_id) {
				team = 'home';
			}
			switch (autocomplete) {
				case 'rebound':
					if ((this.previousPlayerWasHome && team == 'home') || (!this.previousPlayerWasHome && team == 'away')) {
						this.addRebound(team, true);
					} else if ((this.previousPlayerWasHome && team == 'away') || (!this.previousPlayerWasHome && team == 'home')) {
						this.addRebound(team, false);
					}
					break;
				case 'assist':
					this.addAssist(team);
					break;
				case 'missed':
					this.addPoints(team, 2, true);
					break;
				case 'turnover':
					this.addTurnover(team);
					break;
			}
			this.deselectPlayer(selectedPlayer.id);
			this.autocomplete.set(null);
		}
	}, { allowSignalWrites: true });

	//plus_or_minus
	private homeTeamPlusOrMinus = 0;
	private awayTeamPlusOrMinus = 0;

	//minutes
	private clockStarted!: string;

	//gamecast
	private interval: any;

  ngOnInit() {
		this.sync.gameCastInProgress = true;
		this.route.params.subscribe(async params => {
			this.gameId = Number(params['gameId']);
			await this.dataService.setGame(this.gameId);
			this.clock.set(this.dataService.game()!.clock);
			if (this.api.isOnline()) {
				this.interval = setInterval(async () => await this.send(), 15000);
			}
		});
  }

  async ngOnDestroy() {
		this.initSub?.unsubscribe();
    this.stopTimer();
		clearInterval(this.interval);
		this.dataService.destroy();
		await this.send();
		this.sync.gameCastInProgress = false;
  }

  public changeColor(color: string) {
		if (this.colorTeam == 'home') {
			this.homeColor.set(color)
		} else {
			this.awayColor.set(color)
		}
  }

	private async send() {
		try {
			await lastValueFrom(this.api.data.sync([
				this.dataService.players(),
				[this.dataService.game()!],
				this.dataService.stats(),
				this.dataService.plays()
			]));
		} catch (error) {
			console.error("GameCast had errors!", error);
		}
	}

	public async sendLogs(po: IonPopover) {
		this.sendingLogs = true;
		try {
			await this.sync.sendLogsToServer(this.gameId);
		} catch (error) {
			console.error('Failed to submit logs', error)
		}
		this.sendingLogs = false;
		po.dismiss();
	}

	public findStat(playerid: number) {
		return this.dataService.stats().find(t => t.player_id == playerid);
	}

	public async editingStopped(event: CellEditingStoppedEvent<BoxScore>) {
		const { data } = event;
		if (data) {
			const player = this.dataService.players().find(t => t.id == data.player_id)!;
			this.dataService.updateStat({
				player: player,
				updateFn: stat => {
					stat.assists = data.assists;
					stat.offensive_rebounds = data.offensive_rebounds;
					stat.defensive_rebounds = data.defensive_rebounds;
					stat.field_goals_attempted = data.field_goals_attempted;
					stat.field_goals_made = data.field_goals_made;
					stat.threes_attempted = data.threes_attempted;
					stat.threes_made = data.threes_made;
					stat.turnovers = data.turnovers;
					stat.technical_fouls = data.technical_fouls;
					stat.free_throws_attempted = data.free_throws_attempted;
					stat.free_throws_made = data.free_throws_made;
					stat.blocks = data.blocks;
					stat.steals = data.steals;
					stat.plus_or_minus = data.plus_or_minus;
					stat.fouls = data.fouls;
				}
			});
		}
  }

	public addToCourt(team: 'home' | 'away', player: Player) {
		const playersOnCourt = team == 'home' ? this.dataService.homePlayersOnCourt() : this.dataService.awayPlayersOnCourt();
		if(!playersOnCourt.find(t => t.id == player.id)){
			if (playersOnCourt.length < 6) {
				this.dataService.updateStat({
					player: player,
					updateFn: stat => stat.on_court = true
				});
			}
			if(playersOnCourt.length == 6) {
				this.currentPlayersOnCourt.set(team == 'home' ? this.dataService.homePlayersOnCourt() : this.dataService.awayPlayersOnCourt());
				this.sixthPlayer.set(player);
			}
		}
	}

	public subOut(player: Player & { sync_state: SyncState }) {
		const team = this.dataService.homePlayersOnCourt().includes(player)? 'home' : 'away';
		this.removeFromCourt(player);
		this.addToCourt(team, this.sixthPlayer()!);
		this.currentPlayersOnCourt.set(null);
		this.sixthPlayer.set(null);
	}

	public subOutExit() {
		this.currentPlayersOnCourt.set(null);
		this.sixthPlayer.set(null);
	}

	public selectPlayer(player_id: number) {
		const { players, selectedPlayer, game } = this.dataService;
		this.previousPlayerWasHome = players().find(t => t.id == selectedPlayer()?.id)?.team_id == game()?.home_team_id;
		if (this.currentPlayersOnCourt() != null) {
			const player = players().find(t => t.id == player_id);
			this.subOut(player!);
		} else {
			if (selectedPlayer()?.id == player_id) {
				this.dataService.selectedPlayerId.set(null);
			} else {
				this.dataService.selectedPlayerId.set(player_id);
			}
		}
	}

	public deselectPlayer(player_id: number) {
		const { selectedPlayer } = this.dataService;
		this.previousPlayerWasHome = false;
		if (selectedPlayer()?.id == player_id) {
			this.dataService.selectedPlayerId.set(null);
		}
	}

	public clearAllPlayersOnCourt(team: 'home' | 'away') {
		if(team =='home') {
			this.dataService.homePlayersOnCourt().forEach(t => { if(t.number !='-1') {this.removeFromCourt(t);}	})
		} else {
			this.dataService.awayPlayersOnCourt().forEach(t => { if(t.number !='-1') {this.removeFromCourt(t);}	})
		}
	}

  public removeFromCourt(player: Player) {
		if (this.dataService.selectedPlayerId() == player.id) {
			this.dataService.selectedPlayerId.set(null);
		}
		this.dataService.updateStat({
			player: player,
			updateFn: stat => stat.on_court = false
		});
  }

  public addPoints(team: 'home' | 'away', points: number, missed: boolean = false) {
		if (this.dataService.selectedPlayer() === undefined) {
			throw 'No player selected!!'
		}

		if (!missed) {
			this.dataService.updatePeriodTotal(team, points);

			if (!this.timerRunning) {
				this.homeTeamPlusOrMinus = this.dataService.game()!.home_final;
				this.awayTeamPlusOrMinus = this.dataService.game()!.away_final;
				this.calculatePlusOrMinus();
			}
		}

		if (points == 1 && missed) {
			this.dataService.addPlay(team, GameActions.FreeThrowMissed);
			this.dataService.updateStat({
				updateFn: stat => stat.free_throws_attempted++
			});
		} else if (points == 1 && !missed) {
			this.dataService.addPlay(team, GameActions.FreeThrowMade);
			this.dataService.updateStat({
				updateFn: stat => {
					stat.free_throws_attempted++
					stat.free_throws_made++
				}
			});
		} else if (points == 2 && missed) {
			this.dataService.addPlay(team, GameActions.ShotMissed);
			this.dataService.updateStat({
				updateFn: stat => stat.field_goals_attempted++
			});
		} else if (points == 2 && !missed) {
			this.dataService.addPlay(team, GameActions.ShotMade);
			this.dataService.updateStat({
				updateFn: stat => {
					stat.field_goals_attempted++
					stat.field_goals_made++
				}
			});
		} else if (points == 3 && missed) {
			this.dataService.addPlay(team, GameActions.ThreeMissed);
			this.dataService.updateStat({
				updateFn: stat => {
					stat.field_goals_attempted++
					stat.threes_attempted++
				}
			});
		} else if (points == 3 && !missed) {
			this.dataService.addPlay(team, GameActions.ThreeMade);
			this.dataService.updateStat({
				updateFn: stat => {
					stat.field_goals_attempted++
					stat.field_goals_made++
					stat.threes_attempted++
					stat.threes_made++
				}
			});
		}

		if (missed) {
			this.autocomplete.set('rebound')
		} else if (!missed) {
			this.autocomplete.set('assist');
		}
		this.deselectPlayer(this.dataService.selectedPlayer()!.id);
  }

	public dismissAutocomplete() {
		this.autocomplete.set(null);
	}

  public addFoul(team: 'home' | 'away') {
		let player = this.dataService.selectedPlayer();
		if (player) {
			this.stopTimer();
			this.dataService.addFoulToGame(team);
			this.dataService.addPlay(team, GameActions.Foul);
			this.dataService.updateStat({
				updateFn: stat => stat.fouls++
			});
			this.deselectPlayer(player.id);
		}
  }

  public addTimeout(team: 'home' | 'away', partial: boolean) {
		this.stopTimer();
		this.dataService.addTimeoutToGame(team, partial);
		this.dataService.addPlay(team, partial ? GameActions.PartialTO : GameActions.FullTO);
  }

	public addSteal(team: 'home' | 'away') {
		let player = this.dataService.selectedPlayer();
		if (player) {
			this.dataService.addPlay(team, GameActions.Steal);
			this.dataService.updateStat({
				updateFn: stat => stat.steals++
			});
			this.autocomplete.set('turnover');
			this.deselectPlayer(player.id);
		}
	}

	public addAssist(team: 'home' | 'away') {
		let player = this.dataService.selectedPlayer();
		if (player) {
			this.dataService.addPlay(team, GameActions.Assist, player);
			this.dataService.updateStat({
				updateFn: stat => stat.assists++
			});
		}
	}

	public addPassback(team: 'home' | 'away', made: boolean) {
		this.addRebound(team, true);
		setTimeout(() => this.addPoints(team, 2, !made), 300);
		this.autocomplete.set(null);
	}

	public addRebound(team: 'home' | 'away', offensive: boolean) {
		let player = this.dataService.selectedPlayer();
		if (player) {
			this.autocomplete.set('missed');
			this.dataService.updateStat({
				updateFn: stat => {
					stat.rebounds++;
					if (offensive) {
						stat.offensive_rebounds++;
						this.dataService.addPlay(team, GameActions.OffRebound);
					} else {
						stat.defensive_rebounds++;
						this.dataService.addPlay(team, GameActions.DefRebound);
					}
				}
			});
		}
	}

	public addBlock(team: 'home' | 'away') {
		let player = this.dataService.selectedPlayer();
		if (player) {
			this.dataService.addPlay(team, GameActions.Block, player);
			this.dataService.updateStat({
				updateFn: stat => stat.blocks++
			});
			this.autocomplete.set('missed');
			this.deselectPlayer(player.id);
		}
	}

	public addTurnover(team: 'home' | 'away') {
		let player = this.dataService.selectedPlayer();
		if (player) {
			this.dataService.addPlay(team, GameActions.Turnover, player);
			this.dataService.updateStat({
				updateFn: stat => stat.turnovers++
			});
			this.deselectPlayer(player.id);
		}
	}

	public toggleTimer() {
    if (this.timerRunning) {
      this.stopTimer();
    } else {
      this.startTimer();
    }
  }

  private startTimer() {
		const game = this.dataService.game()!;
		const clock = this.clock();
		const resetFouls = game.settings?.reset_fouls;
		const resetTimeouts = game.settings?.reset_timeouts;
		const numOfQuaters = game.has_four_quarters ? 4 : 2;
		this.clockStarted = this.clock();
		if (clock == "00:00") {
			this.dataService.updatePeriod(game.period + 1);
			if (game.period < numOfQuaters) {
				this.timerDuration = game.settings?.minutes_per_period! * 60;
				if (game.period != 0) {
					if (resetFouls == 1) {
						this.dataService.resetFouls();
					}
					if (resetTimeouts == 1 || resetTimeouts == 3) {
						this.dataService.resetTOs();
					}
				}
				if (game.period == (numOfQuaters / 2)) {
					if (resetTimeouts == 2 || resetTimeouts == 4) {
						this.dataService.resetTOs();
					}
					if (resetFouls == 2) {
						this.dataService.resetFouls();
					}
				}
			} else {
				this.timerDuration = game.settings?.minutes_per_overtime! * 60;
				if (resetFouls != 0) {
					this.dataService.resetFouls();
				}
			}
		} else {
			let times = clock.split(':');
			this.timerDuration = Number(times[0].startsWith('0') ? times[0].charAt(1) : times[0]) * 60 + Number(times[1].startsWith('0') ? times[1].charAt(1) : times[1]);
		}
    this.timerRunning = true;
    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.timerDuration > 0) {
        this.timerDuration--;
        this.clock.set(this.getClock());
      } else {
        this.stopTimer();
      }
    });
  }

	private getClock() {
		const minutes = Math.floor(this.timerDuration / 60);
		const seconds = this.timerDuration % 60;
		return `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
	}

	public changePeriod(event: IonInputCustomEvent<InputChangeEventDetail>) {
		const { value } = event.detail;
		if (value) {
			this.dataService.updatePeriod(Number(value));
		}
	}

  private stopTimer() {
    this.timerRunning = false;
		this.timerSubscription?.unsubscribe();
		this.calculatePlusOrMinus();
		this.calculateMinutes();
  }

	private calculatePlusOrMinus() {
		const game = this.dataService.game()!;
		const homePlusOrMinusToAdd = (game.home_final - this.homeTeamPlusOrMinus) - (game.away_final - this.awayTeamPlusOrMinus);
		const awayPlusOrMinusToAdd = homePlusOrMinusToAdd * -1;
		this.dataService.updatePlusOrMinus(homePlusOrMinusToAdd, awayPlusOrMinusToAdd);
		this.homeTeamPlusOrMinus = game.home_final;
		this.awayTeamPlusOrMinus = game.away_final;
	}

	private calculateMinutes() {
		if(this.clockStarted) {
			let timeSpent = ((Number(this.clockStarted!.substring(0, 2)) * 60) + Number(this.clockStarted!.substring(3, 5))) - ((Number(this.clock().substring(0, 2)) * 60) + Number(this.clock().substring(3, 5)));
			const minutes = Math.floor(timeSpent / 60);
			const seconds = timeSpent % 60;
			let timePlayerStay = minutes + (Math.floor((seconds/60) * 100) / 100);
			this.dataService.homePlayersOnCourt().forEach((player) => {
				this.dataService.updateStat({
					player: player,
					updateFn: stat => stat.minutes += timePlayerStay
				});
			})
			this.dataService.awayPlayersOnCourt().forEach((player) => {
				this.dataService.updateStat({
					player: player,
					updateFn: stat => stat.minutes += timePlayerStay
				});
			})
		}
	}

	public updatePlay(play: Play & { sync_state: SyncState }, teamId: number, player_id: number | null, action: GameActions) {
		this.dataService.updatePlay({
			...play,
			team_id: teamId,
			player_id: player_id,
			action: action
		});
	}

	public getPlayDescription(play: Play) {
		const team = play.team_id == this.dataService.game()!.home_team_id ? this.dataService.homeTeam() : this.dataService.awayTeam();
		const player = this.dataService.players().find(t => t.id == play.player_id);
		return `${team?.name} | ${player?.number} ${player?.first_name} ${player?.last_name}`;
	}
}
