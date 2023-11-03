export const version1: string[] = [
	`
		CREATE TABLE IF NOT EXISTS seasons (
			year INTEGER PRIMARY KEY AUTOINCREMENT,
			createdOn TEXT NOT NULL,
			createdBy TEXT NULL
		);
	`,

  `
    CREATE TABLE IF NOT EXISTS teams (
			id INTEGER PRIMARY KEY AUTOINCREMENt,
      name TEXT NOT NULL,
      isMale BOOLEAN NOT NULL,
			seasonId INTEGER NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
			type INTEGER NOT NULL,
			socialMediaString TEXT NULL,
			infoString TEXT NULL,
			division INTEGER NULL,
			defaultLogo TEXT NULL,
			darkModeLogo TEXT NULL,
			FOREIGN KEY (seasonId) REFERENCES seasons(year) ON DELETE CASCADE
    );
  `,

	`CREATE UNIQUE INDEX IF NOT EXISTS ixTeamsSeasonIdNameIsMale ON teams (seasonId, name, isMale);`,

  `
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      number INTEGER NOT NULL,
      position INTEGER NULL,
      picture TEXT NULL,
      teamId INTEGER NOT NULL,
      isMale BOOLEAN NOT NULL,
      height TEXT NULL,
      weight INTEGER NULL,
      age INTEGER NULL,
      homeTown TEXT NULL,
      homeState TEXT NULL,
      socialMediaString TEXT NULL,
      infoString TEXT NULL,
      syncState INTEGER NOT NULL DEFAULT 0,
			FOREIGN KEY (teamId) REFERENCES teams(id) ON DELETE CASCADE
    );
  `,

	`CREATE UNIQUE INDEX IF NOT EXISTS ixPlayersTeamIdIsMaleFirstNameLastName ON players (teamId, isMale, firstName, lastName);`,

  `
    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      homeTeamId INTEGER NOT NULL,
      awayTeamId INTEGER NOT NULL,
      gameDate TEXT NOT NULL,
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
			homeTeamTOL INTEGER GENERATED ALWAYS AS ([homePartialTOL] + [homeFullTOL]),
			awayTeamTOL INTEGER GENERATED ALWAYS AS ([awayPartialTOL] + [awayFullTOL]),
      clock TEXT NOT NULL,
      complete BOOLEAN NOT NULL,
      hasFourQuarters BOOLEAN NULL,
      homeFinal GENERATED ALWAYS AS ([homePointsQ1] + [homePointsQ2] + [homePointsQ3] + [homePointsQ4] + [homePointsOT]),
      awayFinal GENERATED ALWAYS AS ([awayPointsQ1] + [awayPointsQ2] + [awayPointsQ3] + [awayPointsQ4] + [awayPointsOT]),
      period INTEGER NOT NULL,
      gameLink TEXT NULL,
      eventId INTEGER NULL,
			homePartialTOL INTEGER NOT NULL,
			awayPartialTOL INTEGER NOT NULL,
			homeFullTOL INTEGER NOT NULL,
			awayFullTOL INTEGER NOT NULL,
			homeCurrentFouls INTEGER NULL,
			awayCurrentFouls INTEGER NULL,
			homeHasPossession BOOLEAN NULL,
			resetTimeoutsEveryPeriod BOOLEAN NULL,
			fullTimeoutsPerGame INTEGER NULL,
			partialTimeoutsPerGame INTEGER NULL,
			minutesPerPeriod INTEGER NULL,
			minutesPerOvertime INTEGER NULL,
			hiddenPlayers TEXT NULL,
      syncState INTEGER NOT NULL DEFAULT 0,
			FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE SET NULL,
			FOREIGN KEY (awayTeamId) REFERENCES teams(id) ON DELETE CASCADE,
			FOREIGN KEY (homeTeamId) REFERENCES teams(id) ON DELETE CASCADE
    );
  `,

	`CREATE INDEX IF NOT EXISTS ixGamesAwayTeamId ON games (awayTeamId);`,

	`CREATE INDEX IF NOT EXISTS ixGamesEventId ON games (eventId);`,

	`CREATE UNIQUE INDEX IF NOT EXISTS ixGamesGameDateHomeTeamIdAwayTeamId ON games (gameDate, homeTeamId, awayTeamId);`,

	`CREATE INDEX IF NOT EXISTS ixGamesHomeTeamId ON games (homeTeamId);`,

  `
    CREATE TABLE IF NOT EXISTS plays (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
      playOrder INTEGER NOT NULL,
      gameId INTEGER NOT NULL,
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
      FOREIGN KEY (gameId) REFERENCES games(id) ON DELETE CASCADE
    );
  `,

	`CREATE UNIQUE INDEX IF NOT EXISTS ixPlaysGameIdOrder ON plays (gameId, playOrder);`,

  `
    CREATE TABLE IF NOT EXISTS stats (
			id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      playerId INTEGER NOT NULL,
      gameId INTEGER NOT NULL,
      minutes INTEGER NOT NULL,
      assists INTEGER NOT NULL,
      rebounds GENERATED ALWAYS AS ([offensiveRebounds] + [defensiveRebounds]),
      offensiveRebounds INTEGER NOT NULL,
      defensiveRebounds INTEGER NOT NULL,
      fieldGoalsMade INTEGER NOT NULL,
      fieldGoalsAttempted INTEGER NOT NULL,
      blocks INTEGER NOT NULL,
      steals INTEGER NOT NULL,
      threesMade INTEGER NOT NULL,
      threesAttempted INTEGER NOT NULL,
      freethrowsMade INTEGER NOT NULL,
      freethrowsAttempted INTEGER NOT NULL,
      points GENERATED ALWAYS AS ([threesMade] * 3 + [freeThrowsMade] + ([fieldGoalsMade] - [threesMade]) * 2),
      turnovers INTEGER NOT NULL,
      fouls INTEGER NOT NULL,
      plusOrMinus INTEGER NOT NULL,
      eff GENERATED ALWAYS AS (
				([threesMade] * 3 + [freeThrowsMade] + ([fieldGoalsMade] - [threesMade]) * 2 + [offensiveRebounds] + [defensiveRebounds] + [assists] + [steals] + [blocks] - ([fieldGoalsAttempted] - [fieldGoalsMade]) - ([freeThrowsAttempted] - [freeThrowsMade]) - [turnovers])
      ),
			technicalFouls INTEGER NULL,
			onCourt BOOLEAN NULL,
      syncState INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (playerId) REFERENCES players(id) ON DELETE CASCADE,
			FOREIGN KEY (gameId) REFERENCES games(id) ON DELETE CASCADE
    );
  `,

	`CREATE UNIQUE INDEX IF NOT EXISTS ixStatsGameIdPlayerId ON stats (gameId, playerId);`,

	`CREATE INDEX IF NOT EXISTS ixStatsPlayerId ON stats (playerId);`,

  `
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      startDate TEXT NOT NULL,
      endDate TEXT NOT NULL,
      state TEXT NULL,
      title TEXT NOT NULL,
      city TEXT NULL,
      picture TEXT NULL,
			type INTEGER NOT NULL
    );
  `,

  `
    CREATE TABLE IF NOT EXISTS syncHistory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dateOccurred TEXT NOT NULL,
      playsSynced BOOLEAN NOT NULL,
      playersSynced BOOLEAN NOT NULL,
      gamesSynced BOOLEAN NOT NULL,
      statsSynced BOOLEAN NOT NULL,
      errorMessages TEXT NOT NULL
    );
  `
];

export const currentDatabaseVersion = 1;
export const databaseName = "sqlite:theGrindSessionStatsGuru.db";
export const upgrades = {
  database: databaseName,
  upgrade: [
    { toVersion: 1, statements: version1 }
  ]
};
