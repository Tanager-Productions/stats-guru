export const version1: string[] = [
  `
    CREATE TABLE IF NOT EXISTS Teams (
      name TEXT NOT NULL,
      isMale TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      logo TEXT NULL,
      official TEXT NOT NULL,
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
      isMale TEXT NOT NULL,
      syncState INTEGER NOT NULL DEFAULT 0
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
      eventId INTEGER NULL,
			homePartialTOL INTEGER NULL,
			awayPartialTOL INTEGER NULL,
			homeFullTOL INTEGER NULL,
			awayFullTOL INTEGER NULL,
			homeCurrentFouls INTEGER NULL,
			awayCurrentFouls INTEGER NULL,
      syncState INTEGER NOT NULL DEFAULT 0
    );
  `,

  `
    CREATE TABLE IF NOT EXISTS Plays (
      playId INTEGER NOT NULL,
      gameId INTEGER NOT NULL,
      data TEXT NOT NULL,
      syncState INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (playId, gameId)
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
      eff GENERATED ALWAYS AS (
				(([threesMade]*3)+[freeThrowsMade]+(([fieldGoalsMade]-[threesMade])*2))+[rebounds]+[assists]+[steals]+[blocks]-([fieldGoalsAttempted]-[fieldGoalsMade])-([freethrowsAttempted]-[freethrowsMade])-[turnovers]
      ),
			technicalFouls INTEGER NULL,
      syncState INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (player, game)
    );
  `,

  `
    CREATE TABLE IF NOT EXISTS Events (
      eventId INTEGER PRIMARY KEY AUTOINCREMENT,
      startDate TEXT NULL,
      endDate TEXT NULL,
      state TEXT NULL,
      title TEXT NULL,
      city TEXT NULL,
      picture TEXT NULL
    );
  `,

  `
    CREATE TABLE IF NOT EXISTS SyncHistory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dateOccurred TEXT NOT NULL,
      playsSynced INTEGER NOT NULL,
      playersSynced INTEGER NOT NULL,
      gamesSynced INTEGER NOT NULL,
      statsSynced INTEGER NOT NULL,
      errorMessages TEXT NOT NULL
    );
  `
];

export const currentDatabaseVersion = 6;
export const databaseName = "tgs";
export const upgrades = {
  database: databaseName,
  upgrade: [
    { toVersion: 1, statements: version1 }
  ]
};
