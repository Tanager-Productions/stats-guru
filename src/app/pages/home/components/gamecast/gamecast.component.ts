import { ChangeDetectionStrategy, Component, Injector, WritableSignal, computed, effect, inject, signal, untracked } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { SqlService } from 'src/app/services/sql/sql.service';
import { SyncState } from 'src/app/interfaces/syncState.enum';
import { CellEditingStoppedEvent, ColDef, GridApi } from 'ag-grid-community';
import { ApiService } from 'src/app/services/api/api.service';
import { GamecastDto } from 'src/app/interfaces/gamecastDto.interface';
import { currentDatabaseVersion } from 'src/app/upgrades/versions';
import { SyncMode } from 'src/app/interfaces/sync.interface';
import { SyncResult } from 'src/app/interfaces/syncResult.interface';
import { SyncService } from 'src/app/services/sync/sync.service';
import { Game, Player, Stat, Play, GameActions, DEFAULT_PLAYER, GAME_ACTIONS_MAP, DEFAULT_STAT } from 'src/app/interfaces/models';
import { EditPeriodTotalComponent } from '../../../../shared/edit-period-total/edit-period-total.component';
import { AddPlayerComponent } from '../../../../shared/add-player/add-player.component';
import { AgGridModule } from 'ag-grid-angular';
import { GamecastDetailComponent } from '../../../../shared/gamecast-detail/gamecast-detail.component';
import { FormsModule } from '@angular/forms';
import { EditPlayerComponent } from '../../../../shared/edit-player/edit-player.component';
import { NgIf, NgFor, NgClass, SlicePipe, DatePipe } from '@angular/common';
import { IonPopover, IonicModule, LoadingController } from '@ionic/angular';
import { info } from "tauri-plugin-log-api";
import { GamecastService } from 'src/app/services/gamecast/gamecast.service';

const playerSort = (a:Player, b:Player) => {
	if (a.number == b.number)
		return 0;
	else if (a.number < b.number)
		return -1;
	else
		return 1;
}

type StatsRow =  {
  playerId: number,
  blocks: number,
	name:string,
  fieldGoalsAttempted: number,
  fieldGoalsMade: number,
  fouls: number,
  freeThrowsAttempted: number,
  freeThrowsMade: number,
  assists: number,
  plusOrMinus: number,
  points: number,
  rebounds: number,
  defensiveRebounds: number,
  offensiveRebounds: number,
  steals: number,
  threesAttempted: number,
  threesMade: number,
  turnovers: number,
	technicalFouls: number
}

@Component({
	selector: 'app-gamecast',
	templateUrl: './gamecast.component.html',
	styleUrls: ['./gamecast.component.scss'],
	standalone: true,
	imports: [
		IonicModule,
		NgIf,
		RouterLink,
		NgFor,
		EditPlayerComponent,
		NgClass,
		FormsModule,
		GamecastDetailComponent,
		AgGridModule,
		AddPlayerComponent,
		EditPeriodTotalComponent,
		SlicePipe,
		DatePipe,
	],
})
export class GamecastComponent {
	//config
	private gameId!:number;
	private prevPlays?: Play[];
  private timerSubscription?: Subscription;
  private timerDuration!: number;
  public timerRunning: boolean = false;
	private initSub?:Subscription;
	public actions = GAME_ACTIONS_MAP;
	public sendingLogs = false;

	//boxscore modal
	public statsTab: 'home' | 'away' = 'home';
	public homeStatGridApi!: GridApi<StatsRow>;
	public awayStatGridApi!: GridApi<StatsRow>;
	public homeTeamStats!: StatsRow[];
	public awayTeamStats!: StatsRow[];
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

	//color selector
	public isHomeTeam: boolean|null = null;
	public awayColor: string = 'danger';
	public homeColor: string = 'primary';

	//gamecast
	private interval: any;

	//inject
	private route = inject(ActivatedRoute);
	private sql = inject(SqlService);
	private api = inject(ApiService);
	protected sync = inject(SyncService);
	private loadingCtrl = inject(LoadingController);
	private injector = inject(Injector);
	protected dataService = inject(GamecastService);

  ngOnInit() {
		this.initSub = this.sql.isReady().subscribe(ready => {
			if (ready) {
				this.sync.gameCastInProgress = true;
				this.route.params.subscribe(async params => {
					this.gameId = params['gameId'];
					await this.dataService.fetchData(this.gameId);
					if (this.sync.online) {
						this.interval = setInterval(async () => await this.send(), 15000);
					}
				});
			}
		});
  }

	private async send() {
		let dto: GamecastDto = {
			game: this.dataService.game()!,
			version: currentDatabaseVersion,
			overwrite: null,
			mode: SyncMode.Full,
			stats: this.dataService.stats(),
			players: this.dataService.players(),
			plays: this.dataService.plays()
		}
		let response = await this.api.GameCast(dto);
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

	public changeColor(selectedColor: string) {
		if (this.isHomeTeam == false) {
			this.awayColor = selectedColor;
		} else {
			this.homeColor = selectedColor;
		}

		if (this.isHomeTeam == undefined) {
			this.homeColor = 'blue';
			this.awayColor = 'red';
		}
	}

	public async editingStopped(event: CellEditingStoppedEvent<StatsRow>) {
		let statToUpdate = await this.dataService.getStat(event.data!.playerId);
		statToUpdate.assists = event.data!.assists;
		statToUpdate.offensiveRebounds = event.data!.offensiveRebounds;
		statToUpdate.defensiveRebounds = event.data!.defensiveRebounds;
		statToUpdate.fieldGoalsAttempted = event.data!.fieldGoalsAttempted;
		statToUpdate.fieldGoalsMade = event.data!.fieldGoalsMade;
		statToUpdate.threesAttempted = event.data!.threesAttempted;
		statToUpdate.threesMade = event.data!.threesMade;
		statToUpdate.turnovers = event.data!.turnovers;
		statToUpdate.technicalFouls = event.data!.technicalFouls;
		statToUpdate.freeThrowsAttempted = event.data!.freeThrowsAttempted;
		statToUpdate.freeThrowsMade = event.data!.freeThrowsMade;
		statToUpdate.blocks = event.data!.blocks;
		statToUpdate.steals = event.data!.steals;
		statToUpdate.plusOrMinus = event.data!.plusOrMinus;
		statToUpdate.fouls = event.data!.fouls;
		statToUpdate.syncState = SyncState.Modified;
		await this.dataService.updateStat(statToUpdate);
  }

	public async setPrevPlays() {
		const loader = await this.loadingCtrl.create({message: 'Fetching plays...'});
		await loader.present();
		try {
			this.prevPlays = await this.sql.rawQuery(`
				SELECT 		*
				FROM 			Plays
				WHERE 		gameId = '${this.gameId}'
				AND				syncState != 3
				ORDER BY	playOrder DESC
			`);
		} catch(error) {
			console.log('Something went wrong while opening the plays modal', error);
		}
		await loader.dismiss();
	}

	public async loadBoxScore() {
		this.homeTeamStats = await this.sql.rawQuery(`
			SELECT		p.number, p.firstName || ' ' || p.lastName as name, s.playerId, s.assists, s.rebounds,
								s.defensiveRebounds, s.offensiveRebounds, s.fieldGoalsMade, s.fieldGoalsAttempted,
								s.blocks, s.steals, s.threesMade, s.threesAttempted, s.freeThrowsMade, s.freeThrowsAttempted,
								s.points, s.turnovers, s.fouls, s.technicalFouls, s.plusOrMinus
			FROM			stats s
			JOIN			players p ON s.playerId = p.id
			WHERE 		p.teamId = '${this.dataService.game()?.homeTeamId}'
			AND				s.gameId = '${this.gameId}'
			ORDER BY 	p.number;
		`);
		this.awayTeamStats = await this.sql.rawQuery(`
			SELECT		p.number, p.firstName || ' ' || p.lastName as name, s.playerId, s.assists, s.rebounds,
								s.defensiveRebounds, s.offensiveRebounds, s.fieldGoalsMade, s.fieldGoalsAttempted,
								s.blocks, s.steals, s.threesMade, s.threesAttempted, s.freeThrowsMade, s.freeThrowsAttempted,
								s.points, s.turnovers, s.fouls, s.technicalFouls, s.plusOrMinus
			FROM			stats s
			JOIN			players p ON s.playerId = p.id
			WHERE 		p.teamId = '${this.dataService.game()?.awayTeamId}'
			AND				s.gameId = '${this.gameId}'
			ORDER BY 	p.number;
		`);
	}

	public async setTotals(team: 'home'|'away') {
		let totals = await this.sql.rawQuery(`
			SELECT		0 as number, 'Totals' as name, 0 as playerId, SUM(s.assists) as assists, SUM(s.rebounds) as rebounds,
								SUM(s.defensiveRebounds) as defensiveRebounds, SUM(s.offensiveRebounds) as offensiveRebounds,
								SUM(s.fieldGoalsMade) as fieldGoalsMade, SUM(s.fieldGoalsAttempted) as fieldGoalsAttempted,
								SUM(s.blocks) as blocks, SUM(s.steals) as steals, SUM(s.threesMade) as threesMade,
								SUM(s.threesAttempted) as threesAttempted, SUM(s.freeThrowsMade) as freeThrowsMade,
								SUM(s.freeThrowsAttempted) as freeThrowsAttempted, SUM(s.points) as points, SUM(s.turnovers) as turnovers,
								SUM(s.fouls) as fouls, SUM(COALESCE(s.technicalFouls, 0)) as technicalFouls, SUM(s.plusOrMinus) as plusOrMinus
			FROM			stats s
			JOIN			players p ON s.playerId = p.id
			WHERE 		p.teamId = '${team == 'home' ? this.dataService.game()?.homeTeamId : this.dataService.game()?.awayTeamId}'
			AND				s.gameId = '${this.gameId}'
		`);
		if (team == 'home') {
			this.homeStatGridApi.setGridOption('pinnedBottomRowData', totals);
		} else {
			this.awayStatGridApi.setGridOption('pinnedBottomRowData', totals);
		}
	}

	public async addToCourt(team: 'home' | 'away', player: Player) {
		const playersOnCourt = team == 'home' ? this.dataService.homePlayersOnCourt() : this.dataService.awayPlayersOnCourt();
		if (playersOnCourt.length < 6 && !playersOnCourt.find(t => t.id == player.id)) {
			let stat = await this.dataService.getStat(player.id);
			stat.onCourt = 1;
			await this.dataService.updateStat(stat);
		}
	}

	public selectPlayer(team: 'home' | 'away', playerId: number) {
		this.previousPlayerWasHome = this.players()?.find(t => t.id == this.selectedPlayerId())?.teamId == this.dataService.game()?.homeTeamId;
		if (this.selectedPlayerId() == playerId) {
			this.selectedPlayerId.set(null);
		} else {
			this.selectedPlayerId.set(playerId);
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

	public async addTechnical() {
		let stat = await this.dataService.getStat(this.dataService.selectedPlayer()!.id);
		stat.technicalFouls = stat.technicalFouls == null ? 1 : stat.technicalFouls + 1;
		await this.dataService.updateStat(stat);
		this.foulDisplay = false;
	}

  public async removeFromCourt(player: Player) {
		if (this.dataService.selectedPlayer()?.id == player.id) {
			this.dataService.setSelectedPlayer(null);
			let stat = await this.dataService.getStat(player.id);
			stat.onCourt = 0;
			await this.dataService.updateStat(stat);
		}
  }

	public updatePlayerPlay($event:any, play:Play) {
		if ($event.detail.value == null) {
			play.playerNumber = null;
			play.playerName = null;
		} else {
			play.playerNumber = $event.detail.value.number;
			play.playerName = `${$event.detail.value.firstName} ${$event.detail.value.lastName}`;
		}
		this.updatePlay(play);
	}

	private async addPlay(team: 'home' | 'away', action: GameActions, player?: Player) {
		let play: Play = {
			id:0,
			playOrder: this.dataService.plays().length + 1,
			gameId: this.gameId,
			turboStatsData: null,
			syncState: SyncState.Unchanged,
			period: this.dataService.game()!.period,
			playerName: player ? `${player.firstName} ${player.lastName}` : null,
			playerNumber: player ? player.number : null,
			score: `${this.dataService.game()?.homeFinal} - ${this.dataService.game()?.awayFinal}`,
			teamName: team == 'home' ? this.dataService.homeTeamName() : this.dataService.awayTeamName(),
			timeStamp: new Date().toJSON(),
			action: action,
			gameClock: this.dataService.game()!.clock
		}
		let existingPlay = await this.sql.query({
			table: 'plays',
			where: {playOrder: play.playOrder, "gameId": this.gameId}
		});
		if (existingPlay.length == 1) {
			play.syncState = existingPlay[0].SyncState == SyncState.Added ? SyncState.Added : SyncState.Modified;
			await this.sql.save('plays', play, {playOrder: play.playOrder, "gameId": this.gameId});
		} else {
			play.syncState = SyncState.Added;
			await this.sql.save('plays', play);
		}
		this.plays?.unshift(play);
	}

  public async addPoints(team: 'home' | 'away', points: number, missed: boolean = false) {
		let updatePlusOrMinus = false;
		if (!this.timerRunning && !missed) {
			updatePlusOrMinus = true;
			this.homeTeamPlusOrMinus = this.dataService.game()?.homeFinal;
			this.awayTeamPlusOrMinus = this.dataService.game()?.awayFinal;
		}
		let stat = await this.dataService.getStat(this.selectedPlayerId()!);
		let player = this.dataService.selectedPlayer();
		if (points == 1) {
			stat.freeThrowsAttempted++;
			if (!missed) {
				stat.freeThrowsMade++;
				stat.points++;
				await this.addPlay(team, GameActions.FreeThrowMade, player);
			} else {
				await this.addPlay(team, GameActions.FreeThrowMissed, player);
			}
		} else if (points == 2) {
			stat.fieldGoalsAttempted++;
			if (!missed) {
				stat.fieldGoalsMade++;
				stat.points += 2;
				await this.addPlay(team, GameActions.ShotMade, player);
				this.assistDisplay = true;
			} else {
				await this.addPlay(team, GameActions.ShotMissed, player);
				this.reboundDisplay = true;
			}
		} else {
			stat.fieldGoalsAttempted++;
			stat.threesAttempted++;
			if (!missed) {
				stat.fieldGoalsMade++;
				stat.threesMade++;
				stat.points += 3;
				await this.addPlay(team, GameActions.ThreeMade, player);
				this.assistDisplay = true;
			} else {
				await this.addPlay(team, GameActions.ThreeMissed, player);
				this.reboundDisplay = true;
			}
		}
		await this.dataService.updateStat(stat);
		if (!missed) {
			await this.updatePeriodTotal(team, points);
		}
		if (updatePlusOrMinus) {
			await this.calculatePlusOrMinus();
		}
  }

  public async addFoul(team: 'home' | 'away') {
		const game = { ...this.dataService.game() };
		let player = this.dataService.selectedPlayer();
		if (player) {
			await this.stopTimer();
			let stat = await this.dataService.getStat(player.id);
			stat.fouls++;
			await this.dataService.updateStat(stat);
			await this.addPlay(team, GameActions.Foul, player);
			if (team == 'away') {
				if (game.awayCurrentFouls == null) {
					game.awayCurrentFouls = 1;
				} else {
					game.awayCurrentFouls++;
				}
			} else {
				if (game.homeCurrentFouls == null) {
					game.homeCurrentFouls = 1;
				} else {
					game.homeCurrentFouls++;
				}
			}
			this.currentGame.set(game);
		}
		this.foulDisplay = true;
  }

  public async addTimeout(team: 'home' | 'away', partial: boolean) {
		const game = { ...this.dataService.game()! };
		this.stopTimer();
		if (team == 'away') {
			if (game.awayTeamTOL > 0) {
				game.awayTeamTOL--;
			}
			if (partial && game.awayPartialTOL != null && game.awayPartialTOL > 0) {
				game.awayPartialTOL--;
			} else if (!partial && game.awayFullTOL != null && game.awayFullTOL > 0) {
				game.awayFullTOL--;
			}
		} else {
			if (game.homeTeamTOL > 0) {
				game.homeTeamTOL--;
			}
			if (partial && game.homePartialTOL != null && game.homePartialTOL > 0) {
				game.homePartialTOL--;
			} else if (!partial && game.homeFullTOL != null && game.homeFullTOL > 0) {
				game.homeFullTOL--;
			}
		}
		this.currentGame.set(game);
		await this.addPlay(team, partial ? GameActions.PartialTO : GameActions.FullTO);
  }

	public async addSteal(team: 'home' | 'away') {
		let player = this.dataService.selectedPlayer();
		if (player) {
			let stat = await this.dataService.getStat(player.id);
			stat.steals++;
			await this.dataService.updateStat(stat);
			await this.addPlay(team, GameActions.Steal, player);
			this.stealDisplay = true;
		}
	}

	public async addAssist(team: 'home' | 'away') {
		let player = this.dataService.selectedPlayer();
		if (player) {
			let stat = await this.dataService.getStat(player.id);
			stat.assists++;
			await this.dataService.updateStat(stat);
			await this.addPlay(team, GameActions.Assist, player);
		}
	}

	public async addPassback(team: 'home' | 'away', made: boolean) {
		await this.addRebound(team, true);
		await this.addPoints(team, 2, !made);
		this.reboundDisplay = false;
		this.assistDisplay = false;
	}

	public async addRebound(team: 'home' | 'away', offensive: boolean) {
		let player = this.dataService.selectedPlayer();
		if (player) {
			let stat = await this.dataService.getStat(player.id);
			stat.rebounds++;
			if (offensive) {
				stat.offensiveRebounds++;
				await this.addPlay(team, GameActions.OffRebound, player);
			} else {
				stat.defensiveRebounds++;
				await this.addPlay(team, GameActions.DefRebound, player);
			}
			await this.dataService.updateStat(stat);
		}
	}

	public async addBlock(team: 'home' | 'away') {
		let player = this.dataService.selectedPlayer();
		if (player) {
			let stat = await this.dataService.getStat(player.id);
			stat.blocks++;
			await this.dataService.updateStat(stat);
			await this.addPlay(team, GameActions.Block, player);
			this.missedDisplay = true;
		}
	}

	public async addTurnover(team: 'home' | 'away') {
		let player = this.dataService.selectedPlayer();
		if (player) {
			let stat = await this.dataService.getStat(player.id);
			stat.turnovers++;
			await this.dataService.updateStat(stat);
			await this.addPlay(team, GameActions.Turnover, player);
		}
	}

	public async removeLastPlay() {
		let play = this.plays![0];
		await this.undoAction(play);
		if (play.syncState == SyncState.Added) {
			await this.sql.delete('plays', { playOrder: play.playOrder, "gameId": this.gameId });
			this.plays?.shift();
		} else {
			play.syncState = SyncState.Deleted;
			await this.sql.save('plays', play, { playOrder: play.playOrder,"gameId": this.gameId });
			this.plays = this.plays!.filter(t => t.syncState != SyncState.Deleted);
		}
	}

	public async undoAction(play:Play) {
		const game = { ...this.dataService.game() };
		if (play.action == GameActions.Assist) {
			let stat = await this.dataService.getStat(this.getPlayer(play)!.id);
			stat.assists--;
			await this.dataService.updateStat(stat);
		} else if (play.action == GameActions.Block) {
			let stat = await this.dataService.getStat(this.getPlayer(play)!.id);
			stat.blocks--;
			await this.dataService.updateStat(stat);
		} else if (play.action == GameActions.DefRebound) {
			let stat = await this.dataService.getStat(this.getPlayer(play)!.id);
			stat.defensiveRebounds--;
			await this.dataService.updateStat(stat);
		} else if (play.action == GameActions.Foul) {
			let player = this.getPlayer(play)!;
			let stat = await this.dataService.getStat(player.id);
			stat.fouls--;
			await this.dataService.updateStat(stat);
			if (player.teamId == game.homeTeamId) {
				game.homeCurrentFouls!--;
			} else {
				game.awayCurrentFouls!--;
			}
		} else if (play.action == GameActions.FreeThrowMade) {
			let player = this.getPlayer(play)!;
			let stat = await this.dataService.getStat(player.id);
			stat.freeThrowsMade--;
			stat.freeThrowsAttempted--;
			await this.dataService.updateStat(stat);
			if (player.teamId == game.homeTeamId) {
				if (play.period == 1) {
					game.homePointsQ1--;
				} else if (play.period == 2) {
					game.homePointsQ2--;
				} else if (play.period == 3 && game.hasFourQuarters == 0) {
					game.homePointsOT--;
				} else if (play.period == 3 && game.hasFourQuarters == 1) {
					game.homePointsQ3--;
				} else if (play.period == 4) {
					game.homePointsQ4--;
				} else if (play.period == 5) {
					game.homePointsOT--;
				}
				game.homeFinal--;
			} else {
				if (play.period == 1) {
					game.awayPointsQ1--;
				} else if (play.period == 2) {
					game.awayPointsQ2--;
				} else if (play.period == 3 && game.hasFourQuarters == 0) {
					game.awayPointsOT--;
				} else if (play.period == 3 && game.hasFourQuarters == 1) {
					game.awayPointsQ3--;
				} else if (play.period == 4) {
					game.awayPointsQ4--;
				} else if (play.period == 5) {
					game.awayPointsOT--;
				}
				game.awayFinal--;
			}
		} else if (play.action == GameActions.FreeThrowMissed) {
			let stat = await this.dataService.getStat(this.getPlayer(play)!.id);
			stat.freeThrowsAttempted--;
			await this.dataService.updateStat(stat);
		} else if (play.action == GameActions.FullTO) {
			if (play.teamName == this.homeTeamName) {
				game.homeTeamTOL++;
				game.homeFullTOL!++;
			} else {
				game.awayTeamTOL++;
				game.awayFullTOL!++;
			}
		} else if (play.action == GameActions.OffRebound) {
			let stat = await this.dataService.getStat(this.getPlayer(play)!.id);
			stat.offensiveRebounds--;
			await this.dataService.updateStat(stat);
		} else if (play.action == GameActions.PartialTO) {
			if (play.teamName == this.homeTeamName) {
				game.homeTeamTOL++;
				game.homePartialTOL!++;
			} else {
				game.awayTeamTOL++;
				game.awayPartialTOL!++;
			}
		} else if (play.action == GameActions.ShotMade) {
			let player = this.getPlayer(play)!;
			let stat = await this.dataService.getStat(player.id);
			stat.fieldGoalsMade--;
			stat.fieldGoalsAttempted--;
			await this.dataService.updateStat(stat);
			if (player.teamId == game.homeTeamId) {
				if (play.period == 1) {
					game.homePointsQ1 -= 2;
				} else if (play.period == 2) {
					game.homePointsQ2 -= 2;
				} else if (play.period == 3 && game.hasFourQuarters == 0) {
					game.homePointsOT -= 2;
				} else if (play.period == 3 && game.hasFourQuarters == 1) {
					game.homePointsQ3 -= 2;
				} else if (play.period == 4) {
					game.homePointsQ4 -= 2;
				} else if (play.period == 5) {
					game.homePointsOT -= 2;
				}
				game.homeFinal -= 2;
			} else {
				if (play.period == 1) {
					game.awayPointsQ1 -= 2;
				} else if (play.period == 2) {
					game.awayPointsQ2 -= 2;
				} else if (play.period == 3 && game.hasFourQuarters == 0) {
					game.awayPointsOT -= 2;
				} else if (play.period == 3 && game.hasFourQuarters == 1) {
					game.awayPointsQ3 -= 2;
				} else if (play.period == 4) {
					game.awayPointsQ4 -= 2;
				} else if (play.period == 5) {
					game.awayPointsOT -= 2;
				}
				game.awayFinal -= 2;
			}
		} else if (play.action == GameActions.ShotMissed) {
			let stat = await this.dataService.getStat(this.getPlayer(play)!.id);
			stat.fieldGoalsAttempted--;
			await this.dataService.updateStat(stat);
		} else if (play.action == GameActions.Steal) {
			let stat = await this.dataService.getStat(this.getPlayer(play)!.id);
			stat.steals--;
			await this.dataService.updateStat(stat);
		} else if (play.action == GameActions.ThreeMade) {
			let player = this.getPlayer(play)!;
			let stat = await this.dataService.getStat(player.id);
			stat.threesMade--;
			stat.threesAttempted--;
			await this.dataService.updateStat(stat);
			if (player.teamId == game.homeTeamId) {
				if (play.period == 1) {
					game.homePointsQ1 -= 3;
				} else if (play.period == 2) {
					game.homePointsQ2 -= 3;
				} else if (play.period == 3 && game.hasFourQuarters == 0) {
					game.homePointsOT -= 3;
				} else if (play.period == 3 && game.hasFourQuarters == 1) {
					game.homePointsQ3 -= 3;
				} else if (play.period == 4) {
					game.homePointsQ4 -= 3;
				} else if (play.period == 5) {
					game.homePointsOT -= 3;
				}
				game.homeFinal -= 3;
			} else {
				if (play.period == 1) {
					game.awayPointsQ1 -= 3;
				} else if (play.period == 2) {
					game.awayPointsQ2 -= 3;
				} else if (play.period == 3 && game.hasFourQuarters == 0) {
					game.awayPointsOT -= 3;
				} else if (play.period == 3 && game.hasFourQuarters == 1) {
					game.awayPointsQ3 -= 3;
				} else if (play.period == 4) {
					game.awayPointsQ4 -= 3;
				} else if (play.period == 5) {
					game.awayPointsOT -= 3;
				}
				game.awayFinal -= 3;
			}
		} else if (play.action == GameActions.ThreeMissed) {
			let stat = await this.dataService.getStat(this.getPlayer(play)!.id);
			stat.threesAttempted--;
			await this.dataService.updateStat(stat);
		} else if (play.action == GameActions.Turnover) {
			let stat = await this.dataService.getStat(this.getPlayer(play)!.id);
			stat.turnovers--;
			await this.dataService.updateStat(stat);
		}
		this.currentGame.set(game);
	}

	public async redoAction(play:Play) {
		const game = { ...this.dataService.game() };
		if (play.action == GameActions.Assist) {
			let stat = await this.dataService.getStat(this.getPlayer(play)!.id);
			stat.assists++;
			await this.dataService.updateStat(stat);
		} else if (play.action == GameActions.Block) {
			let stat = await this.dataService.getStat(this.getPlayer(play)!.id);
			stat.blocks++;
			await this.dataService.updateStat(stat);
		} else if (play.action == GameActions.DefRebound) {
			let stat = await this.dataService.getStat(this.getPlayer(play)!.id);
			stat.defensiveRebounds++;
			await this.dataService.updateStat(stat);
		} else if (play.action == GameActions.Foul) {
			let player = this.getPlayer(play)!;
			let stat = await this.dataService.getStat(player.id);
			stat.fouls++;
			await this.dataService.updateStat(stat);
			if (player.teamId == game.homeTeamId) {
				game.homeCurrentFouls!++;
			} else {
				game.awayCurrentFouls!++;
			}
		} else if (play.action == GameActions.FreeThrowMade) {
			let player = this.getPlayer(play)!;
			let stat = await this.dataService.getStat(player.id);
			stat.freeThrowsMade++;
			stat.freeThrowsAttempted++;
			await this.dataService.updateStat(stat);
			if (player.teamId == game.homeTeamId) {
				if (play.period == 1) {
					game.homePointsQ1++;
				} else if (play.period == 2) {
					game.homePointsQ2++;
				} else if (play.period == 3 && game.hasFourQuarters == 0) {
					game.homePointsOT++;
				} else if (play.period == 3 && game.hasFourQuarters == 1) {
					game.homePointsQ3++;
				} else if (play.period == 4) {
					game.homePointsQ4++;
				} else if (play.period == 5) {
					game.homePointsOT++;
				}
				game.homeFinal++;
			} else {
				if (play.period == 1) {
					game.awayPointsQ1++;
				} else if (play.period == 2) {
					game.awayPointsQ2++;
				} else if (play.period == 3 && game.hasFourQuarters == 0) {
					game.awayPointsOT++;
				} else if (play.period == 3 && game.hasFourQuarters == 1) {
					game.awayPointsQ3++;
				} else if (play.period == 4) {
					game.awayPointsQ4++;
				} else if (play.period == 5) {
					game.awayPointsOT++;
				}
				game.awayFinal++;
			}
		} else if (play.action == GameActions.FreeThrowMissed) {
			let stat = await this.dataService.getStat(this.getPlayer(play)!.id);
			stat.freeThrowsAttempted++;
			await this.dataService.updateStat(stat);
		} else if (play.action == GameActions.FullTO) {
			if (play.teamName == this.homeTeamName) {
				game.homeTeamTOL--;
				game.homeFullTOL!--;
			} else {
				game.awayTeamTOL--;
				game.awayFullTOL!--;
			}
		} else if (play.action == GameActions.OffRebound) {
			let stat = await this.dataService.getStat(this.getPlayer(play)!.id);
			stat.offensiveRebounds++;
			await this.dataService.updateStat(stat);
		} else if (play.action == GameActions.PartialTO) {
			if (play.teamName == this.homeTeamName) {
				game.homeTeamTOL--;
				game.homePartialTOL!--;
			} else {
				game.awayTeamTOL--;
				game.awayPartialTOL!--;
			}
		} else if (play.action == GameActions.ShotMade) {
			let player = this.getPlayer(play)!;
			let stat = await this.dataService.getStat(player.id);
			stat.fieldGoalsMade++;
			stat.fieldGoalsAttempted++;
			await this.dataService.updateStat(stat);
			if (player.teamId == game.homeTeamId) {
				if (play.period == 1) {
					game.homePointsQ1 += 2;
				} else if (play.period == 2) {
					game.homePointsQ2 += 2;
				} else if (play.period == 3 && game.hasFourQuarters == 0) {
					game.homePointsOT += 2;
				} else if (play.period == 3 && game.hasFourQuarters == 1) {
					game.homePointsQ3 += 2;
				} else if (play.period == 4) {
					game.homePointsQ4 += 2;
				} else if (play.period == 5) {
					game.homePointsOT += 2;
				}
				game.homeFinal += 2;
			} else {
				if (play.period == 1) {
					game.awayPointsQ1 += 2;
				} else if (play.period == 2) {
					game.awayPointsQ2 += 2;
				} else if (play.period == 3 && game.hasFourQuarters == 0) {
					game.awayPointsOT += 2;
				} else if (play.period == 3 && game.hasFourQuarters == 1) {
					game.awayPointsQ3 += 2;
				} else if (play.period == 4) {
					game.awayPointsQ4 += 2;
				} else if (play.period == 5) {
					game.awayPointsOT += 2;
				}
				game.awayFinal += 2;
			}
		} else if (play.action == GameActions.ShotMissed) {
			let stat = await this.dataService.getStat(this.getPlayer(play)!.id);
			stat.fieldGoalsAttempted++;
			await this.dataService.updateStat(stat);
		} else if (play.action == GameActions.Steal) {
			let stat = await this.dataService.getStat(this.getPlayer(play)!.id);
			stat.steals++;
			await this.dataService.updateStat(stat);
		} else if (play.action == GameActions.ThreeMade) {
			let player = this.getPlayer(play)!;
			let stat = await this.dataService.getStat(player.id);
			stat.threesMade++;
			stat.threesAttempted++;
			await this.dataService.updateStat(stat);
			if (player.teamId == game.homeTeamId) {
				if (play.period == 1) {
					game.homePointsQ1 += 3;
				} else if (play.period == 2) {
					game.homePointsQ2 += 3;
				} else if (play.period == 3 && game.hasFourQuarters == 0) {
					game.homePointsOT += 3;
				} else if (play.period == 3 && game.hasFourQuarters == 1) {
					game.homePointsQ3 += 3;
				} else if (play.period == 4) {
					game.homePointsQ4 += 3;
				} else if (play.period == 5) {
					game.homePointsOT += 3;
				}
				game.homeFinal += 3;
			} else {
				if (play.period == 1) {
					game.awayPointsQ1 += 3;
				} else if (play.period == 2) {
					game.awayPointsQ2 += 3;
				} else if (play.period == 3 && game.hasFourQuarters == 0) {
					game.awayPointsOT += 3;
				} else if (play.period == 3 && game.hasFourQuarters == 1) {
					game.awayPointsQ3 += 3;
				} else if (play.period == 4) {
					game.awayPointsQ4 += 3;
				} else if (play.period == 5) {
					game.awayPointsOT += 3;
				}
				game.awayFinal += 3;
			}
		} else if (play.action == GameActions.ThreeMissed) {
			let stat = await this.dataService.getStat(this.getPlayer(play)!.id);
			stat.threesAttempted++;
			await this.dataService.updateStat(stat);
		} else if (play.action == GameActions.Turnover) {
			let stat = await this.dataService.getStat(this.getPlayer(play)!.id);
			stat.turnovers++;
			await this.dataService.updateStat(stat);
		}
		this.currentGame.set(game);
	}

	public async updatePlay(play: Play) {
		let prevPlay = this.prevPlays!.find(t => t.playOrder == play.playOrder)!;
		if (prevPlay.teamName != play.teamName && play.playerName != null) {
			if (play.teamName == this.homeTeamName) {
				play.playerName = this.homeTeamPlayers()[0].firstName + ' ' + this.homeTeamPlayers()[0].lastName;
				play.playerNumber = this.homeTeamPlayers()[0].number;
			} else {
				play.playerName = this.awayTeamPlayers()[0].firstName + ' ' + this.awayTeamPlayers()[0].lastName;
				play.playerNumber = this.awayTeamPlayers()[0].number;
			}
		}
		await this.undoAction(prevPlay);
		await this.redoAction(play);
		play.score = `${this.dataService.game()?.homeFinal} - ${this.dataService.game()?.awayFinal}`;
		play.syncState = play.syncState == SyncState.Added ? SyncState.Added : SyncState.Modified;
		await this.sql.save('plays', play, {playOrder: play.playOrder, "gameId": this.gameId});
		await this.setPrevPlays();
	}

	public getPlayer(play:Play) {
		if (play.teamName == this.dataService.homeTeamName()) {
			return this.dataService.homeTeamPlayers().find(t => t.number == play.playerNumber && `${t.firstName} ${t.lastName}` == play.playerName);
		} else {
			return this.dataService.awayTeamPlayers().find(t => t.number == play.playerNumber && `${t.firstName} ${t.lastName}` == play.playerName);
		}
	}

	public startStopTimer() {
    if (this.timerRunning) {
      this.stopTimer();
    } else {
      this.startTimer();
    }
  }

  private startTimer() {
		const game = { ...this.dataService.game()! };
		if (game.clock == "00:00") {
			if (game.period < (game.hasFourQuarters == 1 ? 4 : 2))
				this.timerDuration = game.minutesPerPeriod! * 60;
			else
				this.timerDuration = game.minutesPerOvertime! * 60;
			game.period++;
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
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
		this.calculatePlusOrMinus();
  }

	private async calculatePlusOrMinus() {
		let homePlusOrMinusToAdd = (this.dataService.game()?.homeFinal - this.homeTeamPlusOrMinus) - (this.dataService.game()?.awayFinal - this.awayTeamPlusOrMinus);
		let awayPlusOrMinusToAdd = homePlusOrMinusToAdd * -1;
		let homePlayers = this.homePlayersOnCourt().slice(0);
		let awayPlayers = this.awayPlayersOnCourt().slice(0);
		for (let item of homePlayers) {
			let stat = await this.dataService.getStat(item.id);
			stat.plusOrMinus += homePlusOrMinusToAdd;
			await this.dataService.updateStat(stat);
		}
		for (let item of awayPlayers) {
			let stat = await this.dataService.getStat(item.id);
			stat.plusOrMinus += awayPlusOrMinusToAdd;
			await this.dataService.updateStat(stat);
		}
		this.homeTeamPlusOrMinus = this.dataService.game()?.homeFinal;
		this.awayTeamPlusOrMinus = this.dataService.game()?.awayFinal;
	}

  async ngOnDestroy() {
		this.initSub?.unsubscribe();
    this.stopTimer();
		clearInterval(this.interval);
		await this.send();
		this.sync.gameCastInProgress = false;
  }
}
