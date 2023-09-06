export interface Game {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  gameDate: string;
  homePointsQ1: number;
  awayPointsQ1: number;
  homePointsQ2: number;
  awayPointsQ2: number;
  homePointsQ3: number;
  awayPointsQ3: number;
  homePointsQ4: number;
  awayPointsQ4: number;
  homePointsOT: number;
  awayPointsOT: number;
  isMale: number;
  complete: number;
  clock: string;
  homeTeamTOL: number;
  awayTeamTOL: number;
  hasFourQuarters: number | null;
  homeFinal: number;
  awayFinal: number;
  period: number;
  gameLink: string | null;
  eventId: number | null;
  syncState: number;
}

export interface ServerGame {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  gameDate: string;
  homePointsQ1: number;
  awayPointsQ1: number;
  homePointsQ2: number;
  awayPointsQ2: number;
  homePointsQ3: number;
  awayPointsQ3: number;
  homePointsQ4: number;
  awayPointsQ4: number;
  homePointsOT: number | null;
  awayPointsOT: number | null;
  isMale: boolean;
  complete: boolean;
  clock: string;
  homeTeamTOL: number;
  awayTeamTOL: number;
  hasFourQuarters: boolean | null;
  homeFinal: number | null;
  awayFinal: number | null;
  period: number;
  gameLink: string | null;
  eventId: number | null;
}
