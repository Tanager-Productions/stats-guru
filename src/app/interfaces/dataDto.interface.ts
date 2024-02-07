import { Stat, Play, Player, Game, Team, Season, Event } from "@tanager/tgs";

export interface DataDto {
	stats: Stat[];
	plays: Play[];
	players: Player[];
	games: Game[];
	teams: Team[];
	seasons: Season[];
	events: Event[];
}
