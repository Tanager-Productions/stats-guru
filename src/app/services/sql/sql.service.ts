import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteDBConnection, SQLiteConnection, capSQLiteSet,
         capSQLiteChanges, capSQLiteValues, capEchoResult, capSQLiteResult,
         capNCDatabasePathResult } from '@capacitor-community/sqlite';
import { currentDatabaseVersion, databaseName } from 'src/app/upgrades/version1';

@Injectable({
  providedIn: 'root'
})
export class SqlService {
  sqlite!: SQLiteConnection;
  isService: boolean = false;
  platform?: string;
  sqlitePlugin: any;
  native: boolean = false;

  constructor() { }

  /**
   * Plugin Initialization
   */
  async initializePlugin(): Promise<boolean> {
    this.platform = Capacitor.getPlatform();
    if ( this.platform === 'ios' || this.platform === 'android' ) {
      this.native = true;
    }
    this.sqlitePlugin = CapacitorSQLite;
    this.sqlite = new SQLiteConnection(this.sqlitePlugin);
    this.isService = true;
    return true;
  }

  /**
   * Echo a value
   * @param value
   */
  async echo(value: string): Promise<capEchoResult> {
    this.ensureConnectionIsOpen();
    return this.sqlite.echo(value);
  }

  async addUpgradeStatement(database: string, toVersion: number, statements: string[]): Promise<void> {
    this.ensureConnectionIsOpen();
    return this.sqlite.addUpgradeStatement(database, toVersion, statements);
  }

  /**
   * Create a connection to a database
   * @param database
   * @param encrypted
   * @param mode
   * @param version
   */
  async createConnection(): Promise<SQLiteDBConnection> {
    this.ensureConnectionIsOpen();
    const db: SQLiteDBConnection = await this.sqlite.createConnection(databaseName, false, "no-encryption", currentDatabaseVersion, false);
    if ( db == null ) {
      throw new Error(`no db returned is null`);
    }
    return db;
  }

  /**
   * Close a connection to a database
   * @param database
   */
  async closeConnection(database: string): Promise<void> {
    this.ensureConnectionIsOpen();
    return this.sqlite.closeConnection(database, false);
  }

  /**
   * Retrieve an existing connection to a database
   * @param database
   */
  async retrieveConnection(database: string): Promise<SQLiteDBConnection> {
    this.ensureConnectionIsOpen();
    return this.sqlite.retrieveConnection(database, false);
  }

  /**
   * Retrieve all existing connections
   */
  async retrieveAllConnections(): Promise<Map<string, SQLiteDBConnection>> {
    this.ensureConnectionIsOpen();
    return this.sqlite.retrieveAllConnections();
  }

  /**
   * Close all existing connections
   */
  async closeAllConnections(): Promise<void> {
    this.ensureConnectionIsOpen();
    return this.sqlite.closeAllConnections();
  }

  /**
   * Check if connection exists
   * @param database
   */
  async isConnection(database: string): Promise<capSQLiteResult> {
    this.ensureConnectionIsOpen();
    return this.sqlite.isConnection(database, false);
  }

  /**
   * Check Connections Consistency
   * @returns
   */
  async checkConnectionsConsistency(): Promise<capSQLiteResult> {
    this.ensureConnectionIsOpen();
    return this.sqlite.checkConnectionsConsistency();
  }

  /**
   * Check if database exists
   * @param database
   */
  async isDatabase(database: string): Promise<capSQLiteResult> {
    this.ensureConnectionIsOpen();
    return this.sqlite.isDatabase(database);
  }

  /**
   * Get the list of databases
   */
  async getDatabaseList(): Promise<capSQLiteValues> {
    this.ensureConnectionIsOpen();
    return this.sqlite.getDatabaseList();
  }

  /**
   * Import from a Json Object
   * @param jsonstring
   */
  async importFromJson(jsonstring: string): Promise<capSQLiteChanges> {
    this.ensureConnectionIsOpen();
    return this.sqlite.importFromJson(jsonstring);
  }

  /**
   * Is Json Object Valid
   * @param jsonString Check the validity of a given Json Object
   */

  async isJsonValid(jsonString: string): Promise<capSQLiteResult> {
    this.ensureConnectionIsOpen();
    return this.sqlite.isJsonValid(jsonString);
  }

  /**
   * Copy databases from public/assets/databases folder to application databases folder
   */
  async copyFromAssets(overwrite?: boolean): Promise<void> {
    const mOverwrite: boolean = overwrite != null ? overwrite : true;
    this.ensureConnectionIsOpen();
    return this.sqlite.copyFromAssets(mOverwrite);
  }

  private ensureConnectionIsOpen() {
    if ( this.sqlite == null ) {
      throw new Error(`no connection open`);
    }
  }
}
