export interface Player {
  playerId: number;
  firstName: string;
  lastName: string;
  number: number;
  position: string;
  team: string;
  picture: string | null;
  isMale: string;
  syncState: number;
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
