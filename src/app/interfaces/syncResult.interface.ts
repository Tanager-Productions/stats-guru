export interface SyncResult {
  playsSynced: boolean;
  playersSynced: boolean;
  teamsSynced: boolean;
  gamesSynced: boolean;
  statsSynced: boolean;
  eventsSynced: boolean;
  errorMessages: string[];
}
