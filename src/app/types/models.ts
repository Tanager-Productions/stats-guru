import { Team, Season, Event, Game as GameDto, Play as PlayDto, Player as PlayerDto, Stat as StatDto, GameActions } from "@tanager/tgs";

export interface DataDto {
	stats: SgStat[];
	plays: SgPlay[];
	players: SgPlayer[];
	games: SgGame[];
	teams: Team[];
	seasons: Season[];
	events: Event[];
}

export interface SgGame {
  game: GameDto;
  syncState: SyncState;
}

export const mapGameToDto = (model: Game): SgGame => {
	return {
		game: { ...model },
		syncState: model.syncState
	}
}

export const mapGameToModel = (dto: SgGame): Game => {
	return {
		...dto.game,
		syncState: dto.syncState
	}
}

export interface SgPlay {
  play: PlayDto;
  syncState: SyncState;
}

export const mapPlayToDto = (model: Play): SgPlay => {
	return {
		play: { ...model },
		syncState: model.syncState
	}
}

export const mapPlayToModel = (dto: SgPlay): Play => {
	return {
		...dto.play,
		syncState: dto.syncState
	}
}

export interface SgPlayer {
  player: PlayerDto;
  syncState: SyncState;
}

export const mapPlayerToDto = (model: Player): SgPlayer => {
	return {
		player: { ...model },
		syncState: model.syncState
	}
}

export const mapPlayerToModel = (dto: SgPlayer): Player => {
	return {
		...dto.player,
		syncState: dto.syncState
	}
}

export interface SgStat {
  stat: StatDto;
  syncState: SyncState;
}

export const mapStatToDto = (model: Stat): SgStat => {
	return {
		stat: { ...model },
		syncState: model.syncState
	}
}

export const mapStatToModel = (dto: SgStat): Stat => {
	return {
		...dto.stat,
		syncState: dto.syncState
	}
}

export type Game = GameDto & { syncState: SyncState };

export type Player = PlayerDto & { syncState: SyncState };

export type Play = PlayDto & { syncState: SyncState };

export type Stat = StatDto & { syncState: SyncState };

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
