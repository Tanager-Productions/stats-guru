export const version1: string[] = [
  `
    CREATE TABLE IF NOT EXISTS teams (
      name TEXT NOT NULL,
      isMale INTEGER NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      logo TEXT NULL,
      official INTEGER NOT NULL,
      PRIMARY KEY (name, isMale)
    );
  `,

  `
    CREATE TABLE IF NOT EXISTS players (
      playerId TEXT PRIMARY KEY,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      number INTEGER NOT NULL,
      position TEXT NOT NULL,
      picture TEXT NULL,
      team TEXT NOT NULL,
      isMale INTEGER NOT NULL,
      height TEXT NULL,
      weight INTEGER NULL,
      age INTEGER NULL,
      homeTown TEXT NULL,
      homeState TEXT NULL,
      socialMediaString TEXT NULL,
      syncState INTEGER NOT NULL DEFAULT 0
    );
  `,

  `
    CREATE TABLE IF NOT EXISTS games (
      gameId TEXT PRIMARY KEY,
      homeTeam TEXT NOT NULL,
      awayTeam TEXT NOT NULL,
      gameDate TEXT NOT NULL,
      clock TEXT NOT NULL,
      complete INTEGER NOT NULL,
      isMale INTEGER NOT NULL,
      has4Quarters INTEGER NULL,
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
      period INTEGER NOT NULL,
      gameLink TEXT NULL,
      eventId INTEGER NULL,
      syncState INTEGER NOT NULL DEFAULT 0
    );
  `,

  `
    CREATE TABLE IF NOT EXISTS plays (
      playId INTEGER NOT NULL,
      gameId TEXT NOT NULL,
      turboStatsData TEXT NULL,
			teamName TEXT NULL,
			playerName TEXT NULL,
			playerNumber INTEGER NULL,
			action INTEGER NULL,
			period INTEGER NULL,
			gameClock TEXT NULL,
			score TEXT NULL,
			timeStamp TEXT NULL,
      syncState INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (playId, gameId)
    );
  `,

  `
    CREATE TABLE IF NOT EXISTS stats (
      player TEXT NOT NULL,
      game TEXT NOT NULL,
      minutes INTEGER NULL,
      assists INTEGER NULL,
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
      rebounds GENERATED ALWAYS AS ([offensiveRebounds]+[defensiveRebounds]),
      eff GENERATED ALWAYS AS (
				(([threesMade]*3)+[freeThrowsMade]+(([fieldGoalsMade]-[threesMade])*2))+[offensiveRebounds]+[defensiveRebounds]+[assists]+[steals]+[blocks]-([fieldGoalsAttempted]-[fieldGoalsMade])-([freethrowsAttempted]-[freethrowsMade])-[turnovers]
      ),
			technicalFouls INTEGER NULL,
      syncState INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (player, game)
    );
  `,

  `
    CREATE TABLE IF NOT EXISTS events (
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
    CREATE TABLE IF NOT EXISTS syncHistory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dateOccurred TEXT NOT NULL,
      playsSynced INTEGER NOT NULL,
      playersSynced INTEGER NOT NULL,
      gamesSynced INTEGER NOT NULL,
      statsSynced INTEGER NOT NULL,
      errorMessages TEXT NOT NULL
    );
  `,

  `
    CREATE TABLE IF NOT EXISTS gameCastSettings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      homePlayersOnCourt TEXT NULL,
      awayPlayersOnCourt TEXT NULL,
      fullTimeouts INTEGER NULL,
			partialTimeouts INTEGER NULL,
      periodsPerGame INTEGER NULL,
      minutesPerPeriod INTEGER NULL,
      minutesPerOvertime INTEGER NULL,
			game TEXT NOT NULL,
			resetTimeoutsEveryPeriod INTEGER NULL,
			homePartialTOL INTEGER NULL,
			awayPartialTOL INTEGER NULL,
			homeFullTOL INTEGER NULL,
			awayFullTOL INTEGER NULL,
			homeCurrentFouls INTEGER NULL,
			awayCurrentFouls INTEGER NULL
    );
  `
];

export const version2: string[] = [
	`ALTER TABLE gameCastSettings ADD COLUMN homeHasPossession INTEGER NULL;`,
	`ALTER TABLE gameCastSettings ADD COLUMN hiddenPlayers TEXT NULL;`
];

export const currentDatabaseVersion = 2;
export const databaseName = "sqlite:statsguru.db";
export const upgrades = {
  database: databaseName,
  upgrade: [
    { toVersion: 1, statements: version1 },
		{ toVersion: 2, statements: version2 }
  ]
};
