import { Game, Play, Stat, Player } from "@tanager-productions/tgs";

export interface SyncDto {
  version: number;
  overwrite: boolean | null;
  mode: SyncMode;
  games: Game[];
  plays: Play[];
  stats: Stat[];
  players: Player[];
}

export enum SyncMode {
  Full = 100,
  Partial = 200
}
