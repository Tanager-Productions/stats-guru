export interface ServerGame {
  gameId: number;
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
  isMale: boolean | null;
  complete: boolean;
  clock: string;
  homeTeamTOL: number;
  awayTeamTOL: number;
  has4Quarters: boolean | null;
  homeFinal?: number | null;
  awayFinal?: number | null;
  period: string | null;
  gameLink: string | null;
  eventId: number | null;
}
