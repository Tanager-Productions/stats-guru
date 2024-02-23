import { Team, Season, Event } from "@tanager/tgs";
import { SgGame, SgPlay, SgPlayer, SgStat } from "./sgDtos";

export interface DataDto {
	stats: SgStat[];
	plays: SgPlay[];
	players: SgPlayer[];
	games: SgGame[];
	teams: Team[];
	seasons: Season[];
	events: Event[];
}
