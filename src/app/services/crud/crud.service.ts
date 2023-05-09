import { Injectable } from '@angular/core';
import { SqlService } from '../sql/sql.service';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';

@Injectable({
  providedIn: 'root'
})
export class CrudService {

  constructor() { }

  public async query(db:SQLiteDBConnection, table:string, where:boolean = false, params?: {[key: string]: string}, orderByColumn?:string, orderDirection:'desc' | 'asc' = 'asc') {
    let sqlcmd:string = `select * from ${table}`;
    if (where && params) {
      sqlcmd += " where ";
      let keys:string[] = Object.keys(params);
      for (let key in params) {
        sqlcmd += `${key} = ${params[key]}`;
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

  public async delete(db:SQLiteDBConnection, table:string, where:boolean = false, params?: {[key: string]: string}) {
    let sqlcmd:string = `delete from ${table}`;
    if (where && params) {
      sqlcmd += " where ";
      let keys:string[] = Object.keys(params);
      for (let key in params) {
        sqlcmd += `${key} = ${params[key]}`;
        if (keys.indexOf(key) != keys.length - 1) {
          sqlcmd += ` and `
        }
      }
    }
    let res = await db.run(sqlcmd);
    if (res.changes == undefined || res.changes.changes == undefined) {
      throw new Error("Execution returned undefined");
    } else {
      return res.changes.changes;
    }
  }

  public async save(db:SQLiteDBConnection, table: string, model: any, where?: any): Promise<void> {
    const isUpdate: boolean = where ? true : false;
    const keys: string[] = Object.keys(model);
    let stmt: string = '';
    let values: any[] = [];
    for (const key of keys) {
      values.push(model[key]);
    }
    if(!isUpdate) {
      const qMarks: string[] = [];
      for (const key of keys) {
        qMarks.push('?');
      }
      stmt = `INSERT INTO ${table} (${keys.toString()}) VALUES (${qMarks.toString()});`;
    } else {
      const wKey: string = Object.keys(where)[0];

      const setString: string = await this.setNameForUpdate(keys);
      if(setString.length === 0) {
        throw new Error(`save: update no SET`);
      }
      stmt = `UPDATE ${table} SET ${setString} WHERE ${wKey}=${where[wKey]}`;
    }
    const ret = await db.run(stmt,values, true);
    if(ret.changes!.changes != 1) {
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
    const ret = await db.run(stmt,values, true);
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

  public async rawQuery(db:SQLiteDBConnection, query:string) {
    let res = await db.query(query);
    if (res.values == undefined) {
      throw new Error("Query returned undefined");
    } else {
      return res.values;
    }
  }

}
