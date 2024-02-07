import { SgGame, SgPlay, SgStat, SgPlayer } from "./sgDtos";

export interface SyncDto {
  version: number;
  overwrite: boolean | null;
  mode: SyncMode;
  games: SgGame[];
  plays: SgPlay[];
  stats: SgStat[];
  players: SgPlayer[];
}

export enum SyncMode {
  Full = 100,
  Partial = 200
}
