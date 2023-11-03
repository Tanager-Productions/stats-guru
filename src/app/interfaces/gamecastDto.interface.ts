import { Play, Player, Stat, Game } from "./models";
import { SyncMode } from "./sync.interface";

export interface GamecastDto {
	plays: Play[];
	players: Player[];
	stats: Stat[];
	game: Game;
	version: number;
	overwrite: boolean | null;
	mode: SyncMode;
}
