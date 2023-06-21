import { Game } from "./game.interface";
import { Play } from "./play.interface";
import { Player } from "./player.interface";
import { Stat } from "./stat.interface";

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
