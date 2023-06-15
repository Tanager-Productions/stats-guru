export interface Play {
  playId: string;
  data: string;
  gameId: number;
  added: string;
  modified: string;
  deleted:string;
}

export interface ServerPlay {
  playId: number;
  data: string;
  gameId: number;
}
