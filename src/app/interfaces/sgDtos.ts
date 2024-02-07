import { Game as GameDto, Play as PlayDto, Player as PlayerDto, Stat as StatDto } from "@tanager/tgs";
import { SyncState } from "./entities";

export interface SgGame {
  game: GameDto;
  syncState: SyncState;
}

export interface SgPlay {
  play: PlayDto;
  syncState: SyncState;
}

export interface SgPlayer {
  player: PlayerDto;
  syncState: SyncState;
}

export interface SgStat {
  stat: StatDto;
  syncState: SyncState;
}

export interface Game extends GameDto {
	syncState: SyncState;
}

export interface Player extends PlayerDto {
	syncState: SyncState;
}

export interface Play extends PlayDto {
	syncState: SyncState;
}

export interface Stat extends StatDto {
	syncState: SyncState;
}
