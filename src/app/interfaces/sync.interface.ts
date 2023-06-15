import { Event } from "./event.interface";
import { Game } from "./game.interface";
import { Play } from "./play.interface";
import { Player } from "./player.interface";
import { Stat } from "./stat.interface";
import { Team } from "./team.interface";

export interface SyncDto {
  version: number;
  overwrite: boolean | null;
  mode: SyncMode;
  games: Game[];
  plays: Play[];
  stats: Stat[];
  teams: Team[];
  players: Player[];
  events: Event[];
}

export enum SyncMode {
  Full = 100,
  Partial = 200
}
