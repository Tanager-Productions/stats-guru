export interface Player {
  playerId: number;
  firstName: string;
  lastName: string;
  number: number;
  position: string;
  team: string;
  picture: string | null;
  isMale: string;
  added: string;
  modified: string;
  deleted:string;
}

export interface ServerPlayer {
  playerId: number;
  firstName: string;
  lastName: string;
  number: number;
  position: string;
  team: string;
  picture: string | null;
  isMale: boolean;
}
