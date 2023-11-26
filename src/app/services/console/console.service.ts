import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConsoleService {
  constructor() { }

	public printConsole(log:string) {
		const { appendFileSync } = require('fs');
		const origConsole = globalThis.console;
		const console = {
			log: (...args: string[]) => {
					appendFileSync('./logresults.txt', args.join('\n') + '\n');
					return origConsole.log.apply(origConsole, args);
			}
		}
		console.log("Hello World!");
		console.log("another line", "yet another line");
	}

}
