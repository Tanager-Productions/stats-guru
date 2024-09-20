import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, concat, fromEvent, map, merge, of, withLatestFrom } from 'rxjs';
import { DataDto, Game, Play, Player, Stat } from 'src/app/app.types';

export enum Credentials {
	ApplicationKey = "statsGuruKey",
	ApiToken = "statsGuruToken"
}

export type User = {
	guid: string,
	email: string,
	fullName: string | null
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
	private http = inject(HttpClient);
	private networkStatus$ = merge(
		fromEvent(window, 'online').pipe(map(() => true)),
		fromEvent(window, 'offline').pipe(map(() => false))
	);
	private ping$ = this.http.get(`ping`, { responseType: 'text' }).pipe(
		map(() => true),
		catchError(() => of(false))
	);
	private online$ = this.networkStatus$.pipe(
		withLatestFrom(this.ping$),
		map(([online, ping]) => online && ping)
	)
	public isOnline = toSignal(this.online$, { initialValue: true });
	public user?: User;

	readonly auth = {
		getCredential: (key: Credentials) => localStorage.getItem(key),
		storeCredential: (key: Credentials, value: string) => localStorage.setItem(key, value),
		fetchUser: () => this.http.get<User>(`rpc/get_current_user`),
		generateApiToken: (p_app_key: string) => this.http.post<string>(`rpc/generate_api_token`, { p_app_key })
	} as const

	readonly data = {
		sync: (tables: [Player[], Game[], Stat[], Play[]]) => {
			const headers = {
				"Prefer": "resolution=merge-duplicates"
			}
			return concat(
				this.http.post(`players?on_conflict=sync_id`, tables[0], { headers }),
				this.http.post(`games?on_conflict=sync_id`, tables[1], { headers }),
				this.http.post(`stats`, tables[2], { headers }),
				this.http.post(`plays`, tables[3], { headers })
			)
		},
		getCurrentSeason: () => this.http.get<DataDto>(`seasons?order=year.desc&limit=1&select=*,games(*,stats(*),plays(*)),players(*),teams(*),events(*)`),
		addLog: (form: FormData) => this.http.post(`rpc/add_log`, form)
	} as const
}
