import { CanActivateFn, Router } from "@angular/router";
import { map, catchError, of, switchMap } from "rxjs";
import { inject } from "@angular/core";
import { ApiService, Credentials } from "./services/api/api.service";

export const isLoggedIn: CanActivateFn = () => {
	const api = inject(ApiService);
	const router = inject(Router);
	const applicationKey = api.auth.getCredential(Credentials.ApplicationKey);
	if (applicationKey) {
		if (api.user()) {
			return of(true);
		} else {
			return api.ping$.pipe(switchMap(online => {
				if (!online) {
					return of(true);
				} else {
					return api.auth.generateApiToken(applicationKey).pipe(
						switchMap(token => {
							api.auth.storeCredential(Credentials.ApiToken, token);
							return api.auth.fetchUser().pipe(map(user => {
								api.user.set(user);
								return true;
							}))
						}),
						catchError(() => of(router.createUrlTree(['/login'])))
					);
				}
			}))
		}
	} else {
		return of(router.createUrlTree(['/login']));
	}
}
