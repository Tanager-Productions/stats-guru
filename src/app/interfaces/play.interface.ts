import { GameActions } from "../pages/home/components/gamecast/gamecast.component";

export interface Play {
  playId: number;
	gameId: string;
	turboStatsData: string | null;
	teamName: string | null;
	playerName: string | null;
	playerNumber: number | null;
	action: GameActions;
	period: number | null;
	gameClock: string | null;
	score: string | null;
	timeStamp: string | null;
  syncState: number;
}

export interface ServerPlay {
	playId: number;
	gameId: string;
	turboStatsData: string | null;
	teamName: string | null;
	playerName: string | null;
	playerNumber: number | null;
	action: GameActions;
	period: number | null;
	gameClock: string | null;
	score: string | null;
	timeStamp: string | null;
}
