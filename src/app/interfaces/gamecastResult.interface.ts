export interface GamecastResult {
	result: boolean;
	error: string;
	resetGame: boolean;
	playersToReset: number[];
	resetStats: boolean;
	resetPlays: boolean;
}
