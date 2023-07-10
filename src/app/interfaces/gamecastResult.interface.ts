export interface GamecastResult {
	result: boolean;
	error: string;
	resetGame: boolean;
	playersToReset: number[];
	statsToReset: number[];
}
