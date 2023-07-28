export interface Player {
  playerId: string;
  firstName: string;
  lastName: string;
  number: number;
  position: string;
  team: string;
  picture: string | null;
  isMale: number;
	height: number | null;
	weight: string | null;
	age: number | null;
	homeTown: string | null;
	homeState: string | null;
	socialMediaString: string | null;
  syncState: number;
}

export interface ServerPlayer {
	playerId: string;
	firstName: string;
	lastName: string;
	number: number;
	position: string;
	team: string;
	picture: string | null;
	isMale: boolean;
	height: string | null;
	weight: number | null;
	age: number | null;
	homeTown: string | null;
	homeState: string | null;
	socialMediaString: string | null;
}
