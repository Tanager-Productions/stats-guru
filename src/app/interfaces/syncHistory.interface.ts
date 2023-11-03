export interface SyncHistory {
  id: number;
  dateOccurred: string;
  playsSynced: boolean;
  playersSynced: boolean;
  gamesSynced: boolean;
  statsSynced: boolean;
  errorMessages: string;
}
