import Dexie, { Table } from 'dexie';
import { Game, Play, Stat, Team, Player, SyncState, DataDto, Event } from './app.types';

export type Season = Pick<DataDto[number], 'year' | 'created_on' | 'conferences'>;

export class StatsGuruDb extends Dexie {
	currentDatabaseVersion = 1;
  seasons!: Table<Season, number>;
  teams!: Table<Team, number>;
  events!: Table<Event, number>;
  games!: Table<Game & { sync_state: SyncState }, number>;
  plays!: Table<Play & { sync_state: SyncState }, { game_id: string, id: number }>;
  stats!: Table<Stat & { sync_state: SyncState }, { game_id: string, player_id: string }>;
  players!: Table<Player & { sync_state: SyncState }, number>;

  constructor() {
    super('stats_guru');
    this.version(1).stores({
      seasons: 'year',
      events: '++id',
			teams: '++id, name',
			plays: '[game_id+id], sync_state',
			stats: '[game_id+player_id], [player_id+game_id], sync_state',
			players: '++id, sync_state, [team_id+first_name+last_name]',
			games: '++id, event_id, [game_date+home_team_id+away_team_id], sync_state'
    });
  }

	getSyncTables() {
		return this.transaction('r', ['games', 'stats', 'plays', 'players'], () => Promise.all([
			this.players.toArray(),
			this.games.toArray(),
			this.stats.toArray(),
			this.plays.toArray()
		]));
	}
}

export const database = new StatsGuruDb();
