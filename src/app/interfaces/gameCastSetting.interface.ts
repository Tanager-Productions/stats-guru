export interface GameCastSettings {
		id:number;
		homePlayersOnCourt: string | null;
		awayPlayersOnCourt: string | null;
		fullTimeouts: number | null;
		partialTimeouts: number | null;
		periodsPerGame: number | null;
		minutesPerPeriod: number | null;
		minutesPerOvertime: number | null;
		game: number;
		resetTimeoutsEveryPeriod: string | null;
		homePartialTOL: number | null;
		awayPartialTOL: number | null;
		homeFullTOL: number | null;
		awayFullTOL: number | null;
		homeCurrentFouls: number | null;
		awayCurrentFouls: number | null;
}
