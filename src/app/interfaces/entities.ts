import { GameActions, Positions, EventTypes, TeamTypes, Divisions } from "@tanager/tgs";

export interface GameEntity {
	id: number;
	homeTeamId: number;
	awayTeamId: number;
	gameDate: string;
	homePointsQ1: number;
	awayPointsQ1: number;
	homePointsQ2: number;
	awayPointsQ2: number;
	homePointsQ3: number;
	awayPointsQ3: number;
	homePointsQ4: number;
	awayPointsQ4: number;
	homePointsOT: number;
	awayPointsOT: number;
	homeTeamTOL: number;
	awayTeamTOL: number;
	complete: 1 | 0;
	clock: string;
	hasFourQuarters: 1 | 0 | null;
	homeFinal: number;
	awayFinal: number;
	period: number;
	gameLink: string | null;
	eventId: number | null;
	homePartialTOL: number;
	awayPartialTOL: number;
	homeFullTOL: number;
	awayFullTOL: number;
	homeCurrentFouls: number | null;
	awayCurrentFouls: number | null;
	homeHasPossession: 1 | 0 | null;
	resetTimeoutsEveryPeriod: 1 | 0 | null;
	fullTimeoutsPerGame: number | null;
	partialTimeoutsPerGame: number | null;
	minutesPerPeriod: number | null;
	minutesPerOvertime: number | null;
	syncState: SyncState;
}

export interface PlayEntity {
	id: number;
	gameId: number;
	turboStatsData: string | null;
	sgLegacyData: string | null;
	teamId: number | null;
	playerId: number | null;
	action: GameActions;
	period: number | null;
	gameClock: string | null;
	score: string | null;
	timeStamp: string | null;
	syncState: SyncState;
}

export interface PlayerEntity {
	id: number;
	firstName: string;
	lastName: string;
	number: number;
	position: Positions | null;
	teamId: number;
	picture: string | null;
	isMale: 1 | 0;
	height: string | null;
	weight: number | null;
	age: number | null;
	homeTown: string | null;
	homeState: string | null;
	socialMedias: string | null;
	generalInfo: string | null;
	syncState: SyncState;
}

export interface StatEntity {
	gameId: number;
	playerId: number;
	minutes: number;
	assists: number;
	rebounds: number;
	defensiveRebounds: number;
	offensiveRebounds: number;
	fieldGoalsMade: number;
	fieldGoalsAttempted: number;
	blocks: number;
	steals: number;
	threesMade: number;
	threesAttempted: number;
	freeThrowsMade: number;
	freeThrowsAttempted: number;
	points: number;
	turnovers: number;
	fouls: number;
	plusOrMinus: number;
	eff: number;
	technicalFouls: number | null;
	onCourt: 1 | 0 | null;
	playerHidden: 1 | 0 | null;
	syncState: SyncState;
}

export interface SeasonEntity {
	year: number;
	createdOn: string;
	createdBy: string | null;
}

export interface EventEntity {
	id: number;
	title: string;
	startDate: string;
	endDate: string;
	state: string | null;
	city: string | null;
	picture: string | null;
	type: EventTypes;
}

export interface TeamEntity {
	id: number;
	name: string;
	isMale: 1 | 0;
	seasonId: number;
	city: string;
	state: string;
	teamType: TeamTypes;
	socialMedias: string | null;
	generalInfo: string | null;
	division: Divisions | null;
	defaultLogo: string | null;
	darkModeLogo: string | null;
}

export interface SyncEntity {
  id: number;
  dateOccurred: string;
  playsSynced: 1 | 0;
  playersSynced: 1 | 0;
  gamesSynced: 1 | 0;
  statsSynced: 1 | 0;
  errorMessages: string;
}

export interface SyncHistory {
  id: number;
  dateOccurred: string;
  playsSynced: boolean;
  playersSynced: boolean;
  gamesSynced: boolean;
  statsSynced: boolean;
  errorMessages: string[];
}

export enum SyncState {
  Unchanged = 0,
  Added = 1,
  Modified = 2,
  Deleted = 3
}

const GAME_ACTIONS_MAP = new Map<GameActions, string>();
GAME_ACTIONS_MAP.set(GameActions.OffRebound, 'Offensive rebound');
GAME_ACTIONS_MAP.set(GameActions.DefRebound, 'Defensive rebound');
GAME_ACTIONS_MAP.set(GameActions.Assist, 'Assist');
GAME_ACTIONS_MAP.set(GameActions.Block, 'Block');
GAME_ACTIONS_MAP.set(GameActions.Steal, 'Steal');
GAME_ACTIONS_MAP.set(GameActions.Foul, 'Foul');
GAME_ACTIONS_MAP.set(GameActions.Turnover, 'Turnover');
GAME_ACTIONS_MAP.set(GameActions.ShotMade, 'Shot made');
GAME_ACTIONS_MAP.set(GameActions.ShotMissed, 'Shot missed');
GAME_ACTIONS_MAP.set(GameActions.ThreeMade, 'Three made');
GAME_ACTIONS_MAP.set(GameActions.ThreeMissed, 'Three missed');
GAME_ACTIONS_MAP.set(GameActions.FreeThrowMissed, 'Free throw missed');
GAME_ACTIONS_MAP.set(GameActions.FreeThrowMade, 'Free throw made');
GAME_ACTIONS_MAP.set(GameActions.FullTO, 'Full timeout');
GAME_ACTIONS_MAP.set(GameActions.PartialTO, 'Partial timeout');
export { GAME_ACTIONS_MAP };
