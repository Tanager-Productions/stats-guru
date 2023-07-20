import { Injectable } from '@angular/core';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Player } from 'src/app/interfaces/player.interface';
import { Game } from 'src/app/interfaces/game.interface';
import { Stat } from 'src/app/interfaces/stat.interface';
import { Play } from 'src/app/interfaces/play.interface';
import { SyncHistory } from 'src/app/interfaces/syncHistory.interface';
import { GameCastSettings } from 'src/app/interfaces/gameCastSetting.interface';

export type Table = 'games' | 'plays' | 'stats' | 'players' | 'events' | 'syncHistory' | 'gameCastSettings' | 'teams';
export type Model = Play | Player | Game | Stat | SyncHistory | GameCastSettings;
export type Direction = 'desc' | 'asc';

@Injectable({
  providedIn: 'root'
})
export class CrudService {

  constructor() { }

  public async query(db:SQLiteDBConnection,
										table:Table,
										where?: {[key: string]: string},
										orderByColumn?:string,
										orderDirection:Direction = 'asc') {
    let sqlcmd:string = `select * from ${table}`;
    if (where) {
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
    let res = await db.query(sqlcmd);
    if (res.values == undefined) {
      throw new Error("Query returned undefined");
    } else {
      return res.values;
    }
  }

  public async delete(db:SQLiteDBConnection,
											table:Table,
											where?: {[key: string]: string}) {
    let sqlcmd:string = `delete from ${table}`;
    if (where) {
      sqlcmd += " where ";
      let keys:string[] = Object.keys(where);
      for (let key in where) {
        sqlcmd += `${key} = ${where[key]}`;
        if (keys.indexOf(key) != keys.length - 1) {
          sqlcmd += ` and `
        }
      }
    }
    let res = await db.run(sqlcmd+=';', undefined, true);
    if (res.changes == undefined || res.changes.changes == undefined) {
      throw new Error("Execution returned undefined");
    } else {
      return res.changes.changes;
    }
  }

  public async save(db:SQLiteDBConnection,
										table: Table,
										model: Model,
										where?: {[key: string]: string}): Promise<void> {
		let castedModel: any = JSON.parse(JSON.stringify(model));
		this.deleteKeys(castedModel, table);
    const isUpdate: boolean = where ? true : false;
    const keys: string[] = Object.keys(castedModel);
    let stmt: string = '';
    let values: any[] = [];
    for (const key of keys) {
      values.push(castedModel[key]);
    }
    if(!isUpdate) {
      const qMarks: string[] = [];
      for (const key of keys) {
        qMarks.push('?');
      }
      stmt = `INSERT INTO ${table} (${keys.toString()}) VALUES (${qMarks.toString()})`;
    } else {
			const setString: string = await this.setNameForUpdate(keys);
      if (setString.length === 0) {
        throw new Error(`save: update no SET`);
      }
      stmt = `UPDATE ${table} SET ${setString} where `;
      let keys2:string[] = Object.keys(where!);
      for (let key in where) {
        stmt += `${key} = ${where[key]}`;
        if (keys2.indexOf(key) != keys2.length - 1) {
          stmt += ` and `
        }
      }
    }
    const ret = await db.run(stmt+=';', values, true);
    if (ret.changes!.changes != 1) {
      throw new Error(`save: insert changes != 1`);
    }
    return;
  }

  public async bulkInsert(db:SQLiteDBConnection, table: string, model: any) {
    const keys: string[] = Object.keys(model[0]);
    let stmt:string = `INSERT INTO ${table} (${keys.toString()}) VALUES `;
    let values: any[] = [];
    for (let item of model) {
      for (const key of keys) {
        values.push(item[key]);
      }
      const qMarks: string[] = [];
      for (const key of keys) {
        qMarks.push('?');
      }
      stmt += `(${qMarks.toString()}),`;
    }
    stmt = stmt.slice(0, stmt.length-1);
    const ret = await db.run(stmt+=';', values, true);
  }

  private async setNameForUpdate(names: string[]): Promise<string> {
    let retString = '';
    for (const name of names) {
      retString += `${name} = ? ,`;
    }
    if (retString.length > 1) {
      retString = retString.slice(0, -1);
      return retString;
    } else {
      throw new Error('SetNameForUpdate: length = 0');
    }
  }

	private deleteKeys(model: any, table: Table) {
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

  public async rawQuery(db:SQLiteDBConnection, query:string) {
    let res = await db.query(query);
    if (res.values == undefined) {
      throw new Error("Query returned undefined");
    } else {
      return res.values;
    }
  }

	public async rawExecute(db:SQLiteDBConnection, statement:string) {
    let res = await db.execute(statement, true);
    if (res.changes!.changes == 0) {
      throw new Error(`save: insert changes == 0`);
    }
  }

}
