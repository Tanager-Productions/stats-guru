export interface SyncHistory {
  id: number;
  dateOccurred: string;
  playsSynced: number;
  playersSynced: number;
  teamsSynced: number;
  gamesSynced: number;
  statsSynced: number;
  eventsSynced: number;
  errorMessages: string;
}
