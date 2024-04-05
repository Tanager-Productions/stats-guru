import { Component, inject, model } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { CellEditingStoppedEvent, ColDef, GridApi } from 'ag-grid-community';
import { ApiService } from 'src/app/services/api/api.service';
import { SyncService } from 'src/app/services/sync/sync.service';
import { EditPeriodTotalComponent } from '../../../../shared/edit-period-total/edit-period-total.component';
import { AddPlayerComponent } from '../../../../shared/add-player/add-player.component';
import { AgGridModule } from 'ag-grid-angular';
import { GamecastDetailComponent } from '../../../../shared/gamecast-detail/gamecast-detail.component';
import { FormsModule } from '@angular/forms';
import { EditPlayerComponent } from '../../../../shared/edit-player/edit-player.component';
import { NgClass, SlicePipe, DatePipe, NgIf } from '@angular/common';
import { IonPopover, IonicModule } from '@ionic/angular';
import { BoxScore, GamecastService } from 'src/app/services/gamecast/gamecast.service';
import { GAME_ACTIONS_MAP, Play, Player, mapGameToDto, mapPlayToDto, mapPlayerToDto, mapStatToDto } from 'src/app/types/models';
import { database } from 'src/app/app.db';
import { SyncMode, SyncResult } from 'src/app/types/sync';
import { GameActions, Team } from '@tanager/tgs';

@Component({
	selector: 'app-gamecast',
	templateUrl: './gamecast.component.html',
	styleUrls: ['./gamecast.component.scss'],
	standalone: true,
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
		DatePipe,
		NgIf
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

	//boxscore modal
	public statsTab: 'home' | 'away' = 'home';
	public homeStatGridApi!: GridApi<BoxScore>;
	public awayStatGridApi!: GridApi<BoxScore>;
	public teamStats: ColDef[] = [
		{field: 'number', headerName: 'NUM', pinned: true, editable: false},
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
		{field: 'technicalFouls', headerName: 'TECH', width: 90},
	];

	//Displaying Auto-Complete Options:
	public reboundDisplay: boolean = false;
	public stealDisplay: boolean = false;
	public assistDisplay: boolean = false;
	public foulDisplay: boolean = false;
	public missedDisplay: boolean = false;
	private previousPlayerWasHome = false;

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
			if (this.sync.online) {
				this.interval = setInterval(async () => await this.send(), 15000);
			}
		});
  }

  async ngOnDestroy() {
		this.initSub?.unsubscribe();
    this.stopTimer();
		clearInterval(this.interval);
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

	public selectPlayer(team: 'home' | 'away', playerId: number) {
		const { players, selectedPlayer, game } = this.dataService;
		this.previousPlayerWasHome = players().find(t => t.id == selectedPlayer()?.id)?.teamId == game()?.homeTeam.teamId;
		if (selectedPlayer()?.id == playerId) {
			this.dataService.selectedPlayerId.set(null);
		} else {
			this.dataService.selectedPlayerId.set(playerId);
		}

		//auto complete
		if (this.stealDisplay) {
			this.addTurnover(team);
			this.stealDisplay = false;
		} else if (this.reboundDisplay) {
			if ((this.previousPlayerWasHome && team == 'home') || (!this.previousPlayerWasHome && team == 'away')) {
				this.addRebound(team, true);
			} else if ((this.previousPlayerWasHome && team == 'away') || (!this.previousPlayerWasHome && team == 'home')) {
				this.addRebound(team, false);
			}
			this.reboundDisplay = false;
		} else if (this.assistDisplay) {
			this.addAssist(team);
			this.assistDisplay = false;
		} else if (this.missedDisplay) {
			this.addPoints(team, 2, true);
			this.missedDisplay = false;
			this.reboundDisplay = true;
		}
	}

	public addTechnical() {
		this.dataService.updateStat({
			updateFn: stat => stat.technicalFouls = stat.technicalFouls == null ? 1 : stat.technicalFouls + 1
		})
		this.foulDisplay = false;
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
			this.foulDisplay = true;
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
			this.stealDisplay = true;
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
		this.reboundDisplay = false;
		this.assistDisplay = false;
	}

	public addRebound(team: 'home' | 'away', offensive: boolean) {
		let player = this.dataService.selectedPlayer();
		if (player) {
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
			this.missedDisplay = true;
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
		const game = { ...this.dataService.game()! };
		if (game.clock == "00:00") {
			if (game.period < (game.hasFourQuarters ? 4 : 2)) {
				this.timerDuration = game.minutesPerPeriod! * 60;
				game.period++;
				this.dataService.updatePeriod(game.period);
			} else {
				this.timerDuration = game.minutesPerOvertime! * 60;
			}
			this.dataService.resetTOs();
		} else {
			let times = game.clock.split(':');
			this.timerDuration = Number(times[0].startsWith('0') ? times[0].charAt(1) : times[0]) * 60 + Number(times[1].startsWith('0') ? times[1].charAt(1) : times[1]);
		}
    this.timerRunning = true;
    this.timerSubscription = interval(1000).subscribe(async () => {
      if (this.timerDuration > 0) {
        this.timerDuration--;
        this.dataService.updateClock(this.timerDuration);
      } else {
        this.stopTimer();
      }
    });
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
