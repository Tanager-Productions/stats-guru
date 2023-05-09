import { Team } from "./team.interface";

export interface Game {
  gameId: number;
  homeTeam: Team;
  awayTeam: Team;
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
  isMale: string | null;
  complete: string;
  clock: string;
  homeTeamTOL: number;
  awayTeamTOL: number;
  has4Quarters: string | null;
  homeFinal: number | null;
  awayFinal: number | null;
  period: string | null;
  gameLink: string | null;
  eventId: number | null;
  added: string;
  modified: string;
  deleted:string;
  
}
