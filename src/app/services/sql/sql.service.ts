import { Injectable } from '@angular/core';
import { currentDatabaseVersion, databaseName, upgrades } from 'src/app/upgrades/versions';
import { BehaviorSubject } from 'rxjs';
import Database from "tauri-plugin-sql-api";
import { Play } from 'src/app/interfaces/play.interface';
import { Player } from 'src/app/interfaces/player.interface';
import { Game } from 'src/app/interfaces/game.interface';
import { GameCastSettings } from 'src/app/interfaces/gameCastSetting.interface';
import { Stat } from 'src/app/interfaces/stat.interface';
import { SyncHistory } from 'src/app/interfaces/syncHistory.interface';

export type Table = 'games' | 'plays' | 'stats' | 'players' | 'events' | 'syncHistory' | 'gameCastSettings' | 'teams';
export type Model = Play | Player | Game | Stat | SyncHistory | GameCastSettings;
export type Direction = 'desc' | 'asc';

@Injectable({
  providedIn: 'root'
})
export class SqlService {
  private initialized: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	private db!:Database;

	public isReady() {
		return this.initialized.asObservable();
	}

	public async init() {
		this.db = await Database.load(databaseName);
		for (let item of upgrades.upgrade) {
			console.log(`Running version ${item.toVersion} upgrades`);
			for (let stmt of item.statements) {
				try {
					await this.db.execute(stmt);
				} catch (error) {
					console.error(error);
				}
			}
		}
		this.initialized.next(true);
	}

  public async query(table:Table, where?: {[key: string]: string | number}, orderByColumn?:string, orderDirection:Direction = 'asc') {
    let sqlcmd:string = `select * from ${table}`;
    if (where) {
			this.normalizeWhereParams(where);
      sqlcmd += " where ";
      let keys:string[] = Object.keys(where);
      for (let key in where) {
        sqlcmd += `${key} = ${where[key]}`;
        if (keys.indexOf(key) != keys.length - 1) {
          sqlcmd += ` and `
        }
      }
    }
    if (orderByColumn) {
      sqlcmd += ` order by ${orderByColumn} ${orderDirection}`;
    }
    return await this.db.select<any[]>(sqlcmd);
  }

  public async delete(table:Table, where?: {[key: string]: string | number}) {
    let sqlcmd:string = `delete from ${table}`;
    if (where) {
			this.normalizeWhereParams(where);
      sqlcmd += " where ";
      let keys:string[] = Object.keys(where);
      for (let key in where) {
        sqlcmd += `${key} = ${where[key]}`;
        if (keys.indexOf(key) != keys.length - 1) {
          sqlcmd += ` and `
        }
      }
    }
    return await this.db.execute(sqlcmd+=';');
  }

	public async save(table:Table, model:Model, where?: {[key: string]: string | number}) {
		let castedModel: any = JSON.parse(JSON.stringify(model));
		this.deleteGeneratedColumns(castedModel, table);
    const keys: string[] = Object.keys(castedModel);
    let values: any[] = [];
    for (const key of keys) {
      values.push(castedModel[key]);
    }
		if (where) {
			return await this.update(table, keys, values, where);
		} else {
			return await this.insert(table, keys, values);
		}
	}

  public async bulkInsert(table: Table, model: any[]) {
    const keys: string[] = Object.keys(model[0]);
    let stmt:string = `INSERT INTO ${table} (${keys.toString()}) VALUES `;
    let values: any[] = [];
		let count = 1;
    for (let item of model) {
      for (const key of keys) {
				if (typeof item[key] == 'boolean') {
					item[key] = item[key] ? 1 : 0;
				}
        values.push(item[key]);
      }
      const qMarks: string[] = [];
      for (const key of keys) {
        qMarks.push(`$${count}`);
				count++;
      }
      stmt += `(${qMarks.toString()}),`;
    }
    stmt = stmt.slice(0, stmt.length-1);
    return await this.db.execute(stmt+=';', values);
  }

  public async rawQuery(query:string) {
    return await this.db.select<any[]>(query);
  }

	public async rawExecute(statement:string) {
		if (!statement.endsWith(';')) {
			statement += ';';
		}
    return await this.db.execute(statement);
  }

  private async insert(table: Table, keys: string[], values: any[]) {
		const qMarks: string[] = [];
		let count = 1;
		for (const key of keys) {
			qMarks.push(`$${count}`);
			count++;
		}
		let stmt = `INSERT INTO ${table} (${keys.toString()}) VALUES (${qMarks.toString()});`;
    return await this.db.execute(stmt, values);
  }

	private async update(table: Table, keys: string[], values: any[], where: {[key: string]: string | number}) {
		this.normalizeWhereParams(where);
		let stmt = `UPDATE ${table} SET ${this.setNameForUpdate(keys)} WHERE `;
		let whereKeys:string[] = Object.keys(where);
		for (let key in where) {
			stmt += `${key} = ${where[key]}`;
			if (whereKeys.indexOf(key) != whereKeys.length - 1) {
				stmt += ' and ';
			}
		}
    return await this.db.execute(stmt+=';', values);
	}

  private setNameForUpdate(names: string[]) {
    let retString = '';
		let count = 1;
    for (const name of names) {
      retString += `${name} = $${count} ,`;
			count++;
    }
    if (retString.length > 1) {
      retString = retString.slice(0, -1);
      return retString;
    } else {
      throw new Error('SetNameForUpdate: length = 0');
    }
  }

	private normalizeWhereParams(where: {[key: string]: string | number} ) {
		for (let item in where) {
			if (typeof where[item] == 'string') {
				where[item] = `'${where[item]}'`;
			}
		}
	}

	private deleteGeneratedColumns(model: any, table: Table) {
		if (table == 'games') {
			delete model.homeFinal;
			delete model.awayFinal;
		} else if (table == 'stats') {
			delete model.points;
			delete model.rebounds;
			delete model.eff;
		} else if (table == 'syncHistory') {
			delete model.id;
		} else if (table == 'gameCastSettings') {
			delete model.id;
		}
	}
}
