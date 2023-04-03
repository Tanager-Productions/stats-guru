export const version1: string[] = [
  `
    CREATE TABLE IF NOT EXISTS Teams (
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      logo TEXT NULL,
      isMale TEXT NOT NULL,
      official TEXT NOT NULL,
      added TEXT NOT NULL,
      modified TEXT NOT NULL,
      deleted TEXT NOT NULL,
      PRIMARY KEY (name, isMale)
    );
  `,

  `
    CREATE TABLE IF NOT EXISTS Players (
      playerId INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      number INTEGER NOT NULL,
      position TEXT NOT NULL,
      picture TEXT NULL,
      team TEXT NOT NULL,
      isMale bit NOT NULL,
      added TEXT NOT NULL,
      modified TEXT NOT NULL,
      deleted TEXT NOT NULL
    );
  `,

  `
    CREATE TABLE IF NOT EXISTS Games (
      gameId INTEGER PRIMARY KEY AUTOINCREMENT,
      homeTeam TEXT NOT NULL,
      awayTeam TEXT NOT NULL,
      gameDate TEXT NOT NULL,
      clock TEXT NOT NULL,
      complete TEXT NOT NULL,
      isMale TEXT NULL,
      has4Quarters TEXT NULL,
      homePointsQ1 INTEGER NOT NULL,
      awayPointsQ1 INTEGER NOT NULL,
      homePointsQ2 INTEGER NOT NULL,
      awayPointsQ2 INTEGER NOT NULL,
      homePointsQ3 INTEGER NOT NULL,
      awayPointsQ3 INTEGER NOT NULL,
      homePointsQ4 INTEGER NOT NULL,
      awayPointsQ4 INTEGER NOT NULL,
      awayPointsOT INTEGER NOT NULL,
      homePointsOT INTEGER NOT NULL,
      homeFinal GENERATED ALWAYS AS ([homePointsQ1]+[homePointsQ2]+[homePointsQ3]+[homePointsQ4]+[homePointsOT]),
      awayFinal GENERATED ALWAYS AS ([awayPointsQ1]+[awayPointsQ2]+[awayPointsQ3]+[awayPointsQ4]+[awayPointsOT]),
      homeTeamTOL INTEGER NOT NULL,
      awayTeamTOL INTEGER NOT NULL,
      period TEXT NULL,
      gameLink TEXT NULL,
      added TEXT NOT NULL,
      modified TEXT NOT NULL,
      deleted TEXT NOT NULL
    );
  `,

  `
    CREATE TABLE IF NOT EXISTS Plays (
      data TEXT NOT NULL,
      gameId INTEGER NOT NULL,
      added TEXT NOT NULL,
      modified TEXT NOT NULL,
      deleted TEXT NOT NULL
    );
  `,

  `
    CREATE TABLE IF NOT EXISTS Stats (
      player INTEGER NOT NULL,
      game INTEGER NOT NULL,
      minutes INTEGER NULL,
      assists INTEGER NULL,
      rebounds INTEGER NULL,
      fieldGoalsMade INTEGER NULL,
      fieldGoalsAttempted INTEGER NULL,
      blocks INTEGER NULL,
      steals INTEGER NULL,
      threesMade INTEGER NULL,
      threesAttempted INTEGER NULL,
      freethrowsMade INTEGER NULL,
      freethrowsAttempted INTEGER NULL,
      points GENERATED ALWAYS AS (([threesMade]*(3)+[freethrowsMade])+([fieldGoalsMade]-[threesMade])*(2)),
      turnovers INTEGER NULL,
      fouls INTEGER NULL,
      plusOrMinus INTEGER NULL,
      offensiveRebounds INTEGER NULL,
      defensiveRebounds INTEGER NULL,
      added TEXT NOT NULL,
      modified TEXT NOT NULL,
      deleted TEXT NOT NULL,
      PRIMARY KEY (player, game)
    );
  `
];
