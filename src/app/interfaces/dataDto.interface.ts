import { Stat, Play, Player, Game, Team, Season } from "./models";

export interface DataDto {
	stats: Stat[];
	plays: Play[];
	players: Player[];
	games: Game[];
	teams: Team[];
	seasons: Season[];
	events: Event[];
}
