import { HttpInterceptorFn } from "@angular/common/http";
import { environment } from "../environments/environment";
import { inject } from "@angular/core";
import { ApiService, Credentials } from "./services/api/api.service";

const serverUrlInterceptor: HttpInterceptorFn = (req, next) => {
	return next(req.clone({ url: `${environment.serverUrl}/${req.url}` }));
}

const authInterceptor: HttpInterceptorFn = (req, next) => {
	const server = inject(ApiService);
	const apiToken = server.auth.getCredential(Credentials.ApiToken);
	if (apiToken) {
		const headers = req.headers.set("X-Access-Token", apiToken);
		return next(req.clone({ headers }));
	} else {
		return next(req);
	}
}

export const appIntercptors = [
	serverUrlInterceptor,
	authInterceptor
]
