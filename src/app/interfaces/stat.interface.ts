export interface Stat {
  player: number;
  game: number;
  minutes: number;
  assists: number;
  rebounds: number;
  defensiveRebounds: number;
  offensiveRebounds: number;
  fieldGoalsMade: number;
  fieldGoalsAttempted: number;
  blocks: number;
  steals: number;
  threesMade: number;
  threesAttempted: number;
  freeThrowsMade: number;
  freeThrowsAttempted: number;
  points: number;
  turnovers: number;
  fouls: number;
  plusOrMinus: number;
  eff: number;
  syncState: number;
	technicalFouls:number | null;
}

export interface ServerStat {
  player: number;
  game: number;
  minutes: number;
  assists: number;
  rebounds: number;
  defensiveRebounds: number;
  offensiveRebounds: number;
  fieldGoalsMade: number;
  fieldGoalsAttempted: number;
  blocks: number;
  steals: number;
  threesMade: number;
  threesAttempted: number;
  freeThrowsMade: number;
  freeThrowsAttempted: number;
  points: number;
  turnovers: number;
  fouls: number;
  plusOrMinus: number;
  eff:number;
	technicalFouls:number | null;
}

