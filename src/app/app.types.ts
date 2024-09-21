export interface Event {
	id: number;
	start_date: string;
	end_date: string;
	state: string | null;
	title: string;
	city: string | null;
	picture: string | null;
	type: EventTypes;
	season_id: number;
}

export type Team = {
	id: number,
	city: string,
	name: string,
	state: string,
	is_male: boolean,
	abbreviation: string | null,
	default_logo: string | null,
	general_info: { [id: string]: string } | null,
	social_medias: { [id: string]: string } | null,
	dark_mode_logo: string | null
}

export type Player = {
	id: number;
	first_name: string;
	last_name: string;
	number: string;
	position: Positions | null;
	team_id: number;
	picture: string | null;
	is_male: boolean;
	height: string | null;
	weight: number | null;
	age: number | null;
	home_town: string | null;
	home_state: string | null;
	social_medias: { [key: string]: string } | null;
	general_info: { [key: string]: string } | null;
	sync_id: string;
}

export interface Stat {
	game_id: string;
	player_id: string;
	minutes: number;
	assists: number;
	rebounds: number;
	defensive_rebounds: number;
	offensive_rebounds: number;
	field_goals_made: number;
	field_goals_attempted: number;
	blocks: number;
	steals: number;
	threes_made: number;
	threes_attempted: number;
	free_throws_made: number;
	free_throws_attempted: number;
	points: number;
	turnovers: number;
	fouls: number;
	plus_or_minus: number;
	eff: number;
	technical_fouls: number | null;
	on_court: boolean | null;
	player_hidden: boolean | null;
	player_number: string | null;
}

export interface Play {
	id: number;
	game_id: string;
	turbo_stats_data: string | null;
	sg_legacy_data: string | null;
	player_id: number | null;
	team_id: number | null;
	action: GameActions;
	period: number | null;
	game_clock: string | null;
	score: string | null;
	time_stamp: string | null;
}

export type Game = {
	id: number;
	season_id: number;
	home_team_id: number;
	away_team_id: number;
	game_date: string;
	home_points_q1: number;
	away_points_q1: number;
	home_points_q2: number;
	away_points_q2: number;
	home_points_q3: number;
	away_points_q3: number;
	home_points_q4: number;
	away_points_q4: number;
	home_points_ot: number;
	away_points_ot: number;
	home_team_tol: number;
	away_team_tol: number;
	complete: boolean;
	clock: string;
	has_four_quarters: boolean | null;
	home_final: number;
	away_final: number;
	period: number;
	game_link: string | null;
	event_id: number | null;
	home_partial_tol: number;
	away_partial_tol: number;
	home_full_tol: number;
	away_full_tol: number;
	home_current_fouls: number | null;
	away_current_fouls: number | null;
	home_has_possession: boolean | null;
	settings: {
		reset_timeouts: ResetTimeoutOptions;
		full_timeouts: number;
		partial_timeouts: number;
		minutes_per_period: number;
		minutes_per_overtime: number;
		reset_fouls: ResetFoulOptions;
	} | null;
	stats: Stat[];
	plays: Play[];
	sync_id: string;
}

enum ResetFoulOptions {
	NoReset = 0,
	ResetEveryPeriod = 1,
	ResetAtHalf = 2
}

enum ResetTimeoutOptions {
	NoReset = 0,
	ResetEveryPeriod = 1,
	ResetAtHalf = 2,
	ResetFullOnlyEveryPeriod = 3,
	ResetFullOnlyEveryHalf = 4
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

export enum EventTypes {
	Preseason = 100,
	Regular = 200,
	Postseason = 300
}

export type DataDto = {
	year: number,
	created_on: Date,
	conferences: {
		name: string,
		divisions: string[],
		logo?: string | null
	}[],
	events: Event[],
	teams: Team[],
	players: Player[],
	games: Game[]
}[];

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
