import { SgGame, SgPlay, SgStat, SgPlayer } from "./models";

export interface SyncDto {
  version: number;
  overwrite: boolean | null;
  mode: SyncMode;
  games: SgGame[];
  plays: SgPlay[];
  stats: SgStat[];
  players: SgPlayer[];
}

export interface GamecastDto {
	plays: SgPlay[];
	players: SgPlayer[];
	stats: SgStat[];
	game: SgGame;
	version: number;
	overwrite: boolean | null;
	mode: SyncMode;
}

export enum SyncMode {
  Full = 100,
  Partial = 200
}

export interface SyncResult {
  playsSynced: boolean;
  playersSynced: boolean;
  teamsSynced: boolean;
  gamesSynced: boolean;
  statsSynced: boolean;
  eventsSynced: boolean;
  errorMessages: string[];
}
