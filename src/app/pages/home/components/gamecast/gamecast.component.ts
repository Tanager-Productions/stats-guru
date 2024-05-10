import { ChangeDetectionStrategy, Component, WritableSignal, effect, inject, model, signal, untracked } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription, interval } from 'rxjs';
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
import { GAME_ACTIONS_MAP, Play, Player, mapGameToDto, mapPlayToDto, mapPlayerToDto, mapStatToDto } from 'src/app/types/models';
import { database } from 'src/app/app.db';
import { SyncMode, SyncResult } from 'src/app/types/sync';
import { GameActions } from '@tanager/tgs';

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
})
export class GamecastComponent {
	//inject
	private route = inject(ActivatedRoute);
	private api = inject(ApiService);
	protected sync = inject(SyncService);
	protected dataService = inject(GamecastService);

	//config
	private gameId!:number;
  private timerSubscription?: Subscription;
  private timerDuration!: number;
  public timerRunning: boolean = false;
	private initSub?:Subscription;
	public actions = GAME_ACTIONS_MAP;
	public sendingLogs = false;
	public homeColor = model('blue');
	public awayColor = model('red');
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
		{field: 'fieldGoalsMade', headerName: 'FGM', width: 90},
		{field: 'fieldGoalsAttempted', headerName: 'FGA', width: 80},
		{field: 'threesMade', headerName: '3FGM', width: 90},
		{field: 'threesAttempted', headerName: '3FGA', width: 90},
		{field: 'freeThrowsMade', headerName: 'FTM', width: 80},
		{field: 'freeThrowsAttempted', headerName: 'FTA', width: 80},
		{field: 'offensiveRebounds', headerName: 'OREB', width: 90},
		{field: 'defensiveRebounds', headerName: 'DREB', width: 90},
		{field: 'turnovers', headerName: 'TO', width: 80},
		{field: 'fouls', headerName: 'FOUL', width: 90},
		{field: 'plusOrMinus', headerName: '+/-', width: 80},
	];

	//Displaying Auto-Complete Options:
	private previousPlayerWasHome = false;
	public autocomplete: WritableSignal<AutoComplete> = signal(null);
	private autocompleteEffect = effect(() => {
		const selectedPlayer = this.dataService.selectedPlayer();
		const autocomplete = untracked(this.autocomplete);
		if (selectedPlayer && autocomplete) {
			const game = untracked(this.dataService.game);
			let team: 'home' | 'away' = 'away';
			if (selectedPlayer.teamId === game?.homeTeam.teamId) {
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

	//plusOrMinus
	private homeTeamPlusOrMinus = 0;
	private awayTeamPlusOrMinus = 0;

	//gamecast
	private interval: any;

  ngOnInit() {
		this.sync.gameCastInProgress = true;
		this.route.params.subscribe(async params => {
			this.gameId = Number(params['gameId']);
			await this.dataService.setGame(this.gameId);
			this.clock.set(this.dataService.game()!.clock);
			if (this.sync.online) {
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
		let response = await this.api.gameCast({
			game: mapGameToDto(this.dataService.game()!),
			version: database.currentDatabaseVersion,
			overwrite: null,
			mode: SyncMode.Full,
			stats: this.dataService.stats().map(mapStatToDto),
			players: this.dataService.players().map(mapPlayerToDto),
			plays: this.dataService.plays().map(mapPlayToDto)
		});
		let result:SyncResult = response.data;
		console.log(result);
		if (result.errorMessages.length > 0) {
			console.error("GameCast had errors!", result.errorMessages);
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

	public async editingStopped(event: CellEditingStoppedEvent<BoxScore>) {
		const { data } = event;
		if (data) {
			const player = this.dataService.players().find(t => t.id == data.playerId)!;
			this.dataService.updateStat({
				player: player,
				updateFn: stat => {
					stat.assists = data.assists;
					stat.offensiveRebounds = data.offensiveRebounds;
					stat.defensiveRebounds = data.defensiveRebounds;
					stat.fieldGoalsAttempted = data.fieldGoalsAttempted;
					stat.fieldGoalsMade = data.fieldGoalsMade;
					stat.threesAttempted = data.threesAttempted;
					stat.threesMade = data.threesMade;
					stat.turnovers = data.turnovers;
					stat.technicalFouls = data.technicalFouls;
					stat.freeThrowsAttempted = data.freeThrowsAttempted;
					stat.freeThrowsMade = data.freeThrowsMade;
					stat.blocks = data.blocks;
					stat.steals = data.steals;
					stat.plusOrMinus = data.plusOrMinus;
					stat.fouls = data.fouls;
				}
			});
		}
  }

	public addToCourt(team: 'home' | 'away', player: Player) {
		const playersOnCourt = team == 'home' ? this.dataService.homePlayersOnCourt() : this.dataService.awayPlayersOnCourt();
		if (playersOnCourt.length < 6 && !playersOnCourt.find(t => t.id == player.id)) {
			this.dataService.updateStat({
				player: player,
				updateFn: stat => stat.onCourt = true
			});
		}
	}

	public selectPlayer(playerId: number) {
		const { players, selectedPlayer, game } = this.dataService;
		this.previousPlayerWasHome = players().find(t => t.id == selectedPlayer()?.id)?.teamId == game()?.homeTeam.teamId;
		if (selectedPlayer()?.id == playerId) {
			this.dataService.selectedPlayerId.set(null);
		} else {
			this.dataService.selectedPlayerId.set(playerId);
		}
	}

	public deselectPlayer(playerId: number) {
		const { selectedPlayer } = this.dataService;
		this.previousPlayerWasHome = false;
		if (selectedPlayer()?.id == playerId) {
			this.dataService.selectedPlayerId.set(null);
		}
	}

	public clearAllPlayersOnCourt(team: 'home' | 'away') {
		if(team =='home') {
			this.dataService.homePlayersOnCourt().forEach(t => { if(t.number !=-1) {this.removeFromCourt(t);}	})
		} else {
			this.dataService.awayPlayersOnCourt().forEach(t => { if(t.number !=-1) {this.removeFromCourt(t);}	})
		}
	}

  public removeFromCourt(player: Player) {
		if (this.dataService.selectedPlayerId() == player.id) {
			this.dataService.selectedPlayerId.set(null);
		}
		this.dataService.updateStat({
			player: player,
			updateFn: stat => stat.onCourt = false
		});
  }

  public addPoints(team: 'home' | 'away', points: number, missed: boolean = false) {
		if (this.dataService.selectedPlayer() === undefined) {
			throw 'No player selected!!'
		}

		if (!missed) {
			this.dataService.updatePeriodTotal(team, points);

			if (!this.timerRunning) {
				this.homeTeamPlusOrMinus = this.dataService.game()!.homeFinal;
				this.awayTeamPlusOrMinus = this.dataService.game()!.awayFinal;
				this.calculatePlusOrMinus();
			}
		}

		if (points == 1 && missed) {
			this.dataService.addPlay(team, GameActions.FreeThrowMissed);
			this.dataService.updateStat({
				updateFn: stat => stat.freeThrowsAttempted++
			});
		} else if (points == 1 && !missed) {
			this.dataService.addPlay(team, GameActions.FreeThrowMade);
			this.dataService.updateStat({
				updateFn: stat => {
					stat.freeThrowsAttempted++
					stat.freeThrowsMade++
				}
			});
		} else if (points == 2 && missed) {
			this.dataService.addPlay(team, GameActions.ShotMissed);
			this.dataService.updateStat({
				updateFn: stat => stat.fieldGoalsAttempted++
			});
		} else if (points == 2 && !missed) {
			this.dataService.addPlay(team, GameActions.ShotMade);
			this.dataService.updateStat({
				updateFn: stat => {
					stat.fieldGoalsAttempted++
					stat.fieldGoalsMade++
				}
			});
		} else if (points == 3 && missed) {
			this.dataService.addPlay(team, GameActions.ThreeMissed);
			this.dataService.updateStat({
				updateFn: stat => {
					stat.fieldGoalsAttempted++
					stat.threesAttempted++
				}
			});
		} else if (points == 3 && !missed) {
			this.dataService.addPlay(team, GameActions.ThreeMade);
			this.dataService.updateStat({
				updateFn: stat => {
					stat.fieldGoalsAttempted++
					stat.fieldGoalsMade++
					stat.threesAttempted++
					stat.threesMade++
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
		this.addPoints(team, 2, !made);
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
						stat.offensiveRebounds++;
						this.dataService.addPlay(team, GameActions.OffRebound);
					} else {
						stat.defensiveRebounds++;
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
		}
	}

	public addTurnover(team: 'home' | 'away') {
		let player = this.dataService.selectedPlayer();
		if (player) {
			this.dataService.addPlay(team, GameActions.Turnover, player);
			this.dataService.updateStat({
				updateFn: stat => stat.turnovers++
			});
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
		if (clock == "00:00") {
			if (game.period <= (game.hasFourQuarters ? 4 : 2)) {
				this.timerDuration = game.minutesPerPeriod! * 60;
				this.dataService.updatePeriod(game.period + 1);
			} else {
				this.timerDuration = game.minutesPerOvertime! * 60;
			}
			this.dataService.resetTOs();
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
  }

	private calculatePlusOrMinus() {
		const game = this.dataService.game()!;
		const homePlusOrMinusToAdd = (game.homeFinal - this.homeTeamPlusOrMinus) - (game.awayFinal - this.awayTeamPlusOrMinus);
		const awayPlusOrMinusToAdd = homePlusOrMinusToAdd * -1;
		this.dataService.updatePlusOrMinus(homePlusOrMinusToAdd, awayPlusOrMinusToAdd);
		this.homeTeamPlusOrMinus = game.homeFinal;
		this.awayTeamPlusOrMinus = game.awayFinal;
	}

	public updatePlay(play: Play, teamId: number, playerId: number | null, action: GameActions) {
		const player = this.dataService.players().find(t => t.id == playerId);
		const game = this.dataService.game()!;
		const team = game.homeTeam.teamId == teamId ? game.homeTeam : game.awayTeam;
		this.dataService.updatePlay({
			...play,
			team: { ...team, name: team.teamName },
			player: player ? { ...player, playerId: player.id } : null,
			action: action
		});
	}
}
