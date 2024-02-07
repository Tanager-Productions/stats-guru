import { SyncMode } from "./sync.interface";
import { SgGame, SgPlay, SgPlayer, SgStat } from "./sgDtos";

export interface GamecastDto {
	plays: SgPlay[];
	players: SgPlayer[];
	stats: SgStat[];
	game: SgGame;
	version: number;
	overwrite: boolean | null;
	mode: SyncMode;
}
