import { HttpBackend, HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, concat, lastValueFrom, map, of, switchMap, timer, withLatestFrom } from 'rxjs';
import { DataDto, Game, Play, Player, Stat, SyncState } from 'src/app/app.types';
import { environment } from 'src/environments/environment';

export enum Credentials {
	ApplicationKey = "statsGuruKey",
	ApiToken = "statsGuruToken"
}

export type User = {
	guid: string,
	email: string,
	full_name: string | null
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
	private http = inject(HttpClient);
	private backend = inject(HttpBackend);
	public ping$ = timer(0, 300000).pipe(
		switchMap(() => this.http.get("ping", { responseType: 'text' })),
		map(() => true),
		catchError(() => of(false))
	);
	public isOnline = toSignal(this.ping$, { initialValue: false });
	public user = signal<User | null>(null);

	readonly auth = {
		getCredential: (key: Credentials) => localStorage.getItem(key),
		storeCredential: (key: Credentials, value: string) => localStorage.setItem(key, value),
		fetchUser: () => this.http.get<User[]>(`rpc/get_current_user`).pipe(map(res => res[0])),
		generateApiToken: (p_app_key: string) => new HttpClient(this.backend).post<string>(`${environment.serverUrl}/rpc/generate_api_token`, { p_app_key })
	} as const

	readonly data = {
		sync: (tables: [(Player & { sync_state: SyncState })[], (Game & { sync_state: SyncState })[], (Stat & { sync_state: SyncState })[], (Play & { sync_state: SyncState })[]]) => {
			const headers = {
				"Prefer": "resolution=merge-duplicates"
			}
			const players = tables[0]
				.filter(t => t.sync_state == SyncState.Added || t.sync_state == SyncState.Modified)
				.map(({ sync_state, id, ...player }) => player);
			const games = tables[1]
				.filter(t => t.sync_state == SyncState.Added || t.sync_state == SyncState.Modified)
				.map(({ sync_state, id, stats, plays, home_team_tol, away_team_tol, home_final, away_final, ...game }) => game);
			const stats = tables[2]
				.filter(t => t.sync_state == SyncState.Added || t.sync_state == SyncState.Modified)
				.map(({ sync_state, points, rebounds, eff, ...stat }) => stat);
			const deletedPlays = tables[3]
				.filter(t => t.sync_state == SyncState.Deleted)
				.map(({ sync_state, ...play }) => play);
			const upsertPlays = tables[3]
				.filter(t => t.sync_state == SyncState.Added || t.sync_state == SyncState.Modified)
				.map(({ sync_state, ...play }) => play);
			return concat(
				players.length ? this.http.post<Player[]>(`players?on_conflict=sync_id`, players, { headers: { "Prefer": "resolution=merge-duplicates,return=representation" } }).pipe(
					withLatestFrom(this.http.get<{ year: number }[]>(`seasons?order=year.desc&limit=1&select=year`).pipe(
						map(res => res[0].year)
					)),
					switchMap(res => {
						return this.http.post(`season_players`, res[0].map(t => ({season_id: res[1], player_id: t.id, created_on: new Date().toJSON()})), { headers: { "Prefer": "resolution=ignore-duplicates" } })
					})
				) : of(true),
				games.length ? this.http.post(`games?on_conflict=sync_id`, games, { headers }) : of(true),
				stats.length ? this.http.post(`stats`, stats, { headers }) : of(true),
				//deletedPlays.length ? this.http.delete(`plays`) : of(true),
				upsertPlays.length ? this.http.post(`plays`, upsertPlays, { headers }) : of(true)
			)
		},
		getCurrentSeason: () => this.http.get<DataDto>(`seasons?order=year.desc&limit=1&select=*,games(*,stats(*),plays(*)),players(*),teams(*),events(*)`),
		addLog: (form: FormData) => this.http.post(`rpc/add_log`, form)
	} as const
}
