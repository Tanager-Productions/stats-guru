export interface SyncHistory {
  id: number;
  dateOccurred: string;
  playsSynced: number;
  playersSynced: number;
  gamesSynced: number;
  statsSynced: number;
  errorMessages: string;
}
