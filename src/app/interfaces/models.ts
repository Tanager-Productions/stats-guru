import { GameActions } from "../pages/home/components/gamecast/gamecast.component";
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
	complete: boolean;
	clock: string;
	hasFourQuarters: boolean | null;
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
	homeHasPossession: boolean | null;
	resetTimeoutsEveryPeriod: boolean | null;
	fullTimeoutsPerGame: number | null;
	partialTimeoutsPerGame: number | null;
	minutesPerPeriod: number | null;
	minutesPerOvertime: number | null;
	hiddenPlayers: string | null;
	syncState: SyncState;
}

export interface Play {
	id: number;
	order: number;
	gameId: number;
	turboStatsData: string | null;
	teamName: string | null;
	playerName: string | null;
	playerNumber: number | null;
	action: GameActions;
	period: number | null;
	gameClock: string | null;
	score: string | null;
	timeStamp: string | null;
	syncState: SyncState;
}

export interface Player {
	id: number;
	firstName: string;
	lastName: string;
	number: number;
	position: Positions | null;
	teamId: number;
	picture: string | null;
	isMale: boolean;
	height: string | null;
	weight: number | null;
	age: number | null;
	homeTown: string | null;
	homeState: string | null;
	socialMediaString: string | null;
	infoString: string | null;
	syncState: SyncState;
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
	onCourt: boolean | null;
	syncState: SyncState;
}

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
	isMale: boolean;
	seasonId: number;
	city: string;
	state: string;
	type: TeamTypes;
	socialMediaString: string | null;
	infoString: string | null;
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
