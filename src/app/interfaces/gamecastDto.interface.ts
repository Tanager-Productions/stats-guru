import { Game } from "./game.interface";
import { Play } from "./play.interface";
import { Player } from "./player.interface";
import { Stat } from "./stat.interface";
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
