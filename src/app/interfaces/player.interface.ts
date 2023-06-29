export interface Player {
  playerId: number;
  firstName: string;
  lastName: string;
  number: number;
  position: string;
  team: string;
  picture: string | null;
  isMale: string;
	height: number | null;
	weight: number | null;
	age: number | null;
	homeTown: string | null;
	homeState: string | null;
	socialMediaString: string | null;
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
	height: number | null;
	weight: number | null;
	age: number | null;
	homeTown: string | null;
	homeState: string | null;
	socialMediaString: string | null;
}
