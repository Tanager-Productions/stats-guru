import { Injectable, WritableSignal, inject, signal } from '@angular/core';
import { Event } from '@tanager/tgs';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  public homePageGames: WritableSignal<HomePageGame[]> = signal([]);
  public events: WritableSignal<Event[]> = signal([]);

  public async initializeService() {
    await Promise.all([
      this.fetchGames(),
      this.fetchEvents()
    ]);
  }

  public async fetchGames() {
    let games = await this.sql.gamesRepo.gamesForHomePage();
    this.homePageGames.set(games);
  }

  public async fetchEvents() {
    let events: Event[] = await this.sql.eventsRepo.getAll();
    this.events.set(events);
  }
}
