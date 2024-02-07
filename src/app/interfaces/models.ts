import { SyncState } from "./syncState.enum";

export interface Game {
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
}

export const DEFAULT_GAME: Game = {
	id: 0,
	homeTeamId: 0,
	awayTeamId: 0,
	gameDate: new Date().toJSON(),
	homePointsQ1: 0,
	awayPointsQ1: 0,
	homePointsQ2: 0,
	awayPointsQ2: 0,
	homePointsQ3: 0,
	awayPointsQ3: 0,
	homePointsQ4: 0,
	awayPointsQ4: 0,
	homePointsOT: 0,
	awayPointsOT: 0,
	homeTeamTOL: 0,
	awayTeamTOL: 0,
	complete: 1,
	clock: "00:00",
	hasFourQuarters: 0,
	homeFinal: 0,
	awayFinal: 0,
	period: 0,
	gameLink: null,
	eventId: null,
	homePartialTOL: 0,
	awayPartialTOL: 0,
	homeFullTOL: 0,
	awayFullTOL: 0,
	homeCurrentFouls: null,
	awayCurrentFouls: null,
	homeHasPossession: null,
	resetTimeoutsEveryPeriod: null,
	fullTimeoutsPerGame: null,
	partialTimeoutsPerGame: null,
	minutesPerPeriod: null,
	minutesPerOvertime: null
}

export interface Play {
	id: number;
	order: number;
	gameId: number;
	turboStatsData: string | null;
	sgLegacyData: string | null;
	playerId: number | null;
	teamId: number | null;
	action: GameActions;
	period: number | null;
	gameClock: string | null;
	score: string | null;
	timeStamp: string | null;
}

export interface Player {
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
}

export const DEFAULT_PLAYER: Player = {
	id: 0,
	firstName: "",
	lastName: "",
	number: 0,
	position: null,
	teamId: 0,
	picture: null,
	isMale: 0,
	height: null,
	weight: null,
	age: null,
	homeTown: null,
	homeState: null,
	socialMedias: null,
	generalInfo: null
}

export interface Stat {
	id: number;
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
	syncState: SyncState;
}

export const DEFAULT_STAT: Stat = {
	id: 0,
	gameId: 0,
	playerId: 0,
	steals: 0,
	assists: 0,
	rebounds: 0,
	offensiveRebounds: 0,
	plusOrMinus: 0,
	technicalFouls: 0,
	threesAttempted: 0,
	threesMade: 0,
	fieldGoalsAttempted: 0,
	fieldGoalsMade: 0,
	freeThrowsAttempted: 0,
	fouls: 0,
	freeThrowsMade: 0,
	minutes: 0,
	defensiveRebounds: 0,
	blocks: 0,
	turnovers: 0,
	syncState: SyncState.Unchanged,
	points: 0,
	eff: 0,
	onCourt: null
};

export interface Season {
	year: number;
	createdOn: string;
	createdBy: string | null;
}

export interface Event {
	id: number;
	startDate: string;
	endDate: string;
	state: string | null;
	title: string;
	city: string | null;
	picture: string | null;
	type: EventTypes;
}

export interface Team {
	id: number;
	name: string;
	isMale: 1 | 0;
	seasonId: number;
	city: string;
	state: string;
	type: TeamTypes;
	socialMedias: string | null;
	generalInfo: string | null;
	division: Divisions | null;
	defaultLogo: string | null;
	darkModeLogo: string | null;
}

export enum TeamTypes {
	Local = 0,
	GrindSession = 1,
	Power = 2
}

export enum Divisions {
	Orange = 1,
	Black = 2
}

export enum EventTypes {
	Preseason = 100,
	Regular = 200,
	Postseason = 300
}

export enum Positions {
	PointGuard = 0,
	ShootingGuard = 1,
	SmallForward = 2,
	PowerForward = 3,
	Center = 4,
	Guard = 5,
	Forward = 6
}

export enum GameActions {
	OffRebound = 5,
	DefRebound = 10,
	Assist = 15,
	Block = 20,
	Steal = 25,
	Foul = 30,
	Turnover = 35,
	ShotMade = 40,
	ShotMissed = 45,
	ThreeMade = 50,
	ThreeMissed = 55,
	FreeThrowMissed = 60,
	FreeThrowMade = 65,
	FullTO = 70,
	PartialTO = 75
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
