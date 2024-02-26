import { Event, Season, Team } from '@tanager/tgs';
import Dexie, { Table } from 'dexie';
import { Game, Play, Player, Stat, SyncHistory } from './types/models';

export class StatsGuruDb extends Dexie {
	currentDatabaseVersion = 1;
  seasons!: Table<Season, number>;
  games!: Table<Game, number>;
  plays!: Table<Play, { gameId: number, id: number }>;
  stats!: Table<Stat, { gameId: number, playerId: number }>;
  teams!: Table<Team, number>;
  players!: Table<Player, number>;
  events!: Table<Event, number>;
  syncHistory!: Table<SyncHistory, number>;

  constructor() {
    super('StatsGuru');
    this.version(1).stores({
			syncHistory: '++id',
      seasons: 'year',
      events: '++id',
			teams: '++id, [seasonId+name+isMale]',
			plays: '[id+gameId], syncState',
			stats: '[gameId+playerId], syncState',
			players: '++id, syncState, [teamId+isMale+firstName+lastName]',
			games: '++id, eventId, [gameDate+homeTeam.teamId+awayTeam.teamId], syncState'
    });
  }

	getSyncTables() {
		return this.transaction('r', ['games', 'stats', 'plays', 'players'], () => {
			return Promise.all([
				this.games.toArray(),
				this.players.toArray(),
				this.stats.toArray(),
				this.plays.toArray()
			])
		});
	}
}

export const database = new StatsGuruDb();
