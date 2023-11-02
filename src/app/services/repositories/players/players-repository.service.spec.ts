import { TestBed } from '@angular/core/testing';

import { PlayersRepositoryService } from './players-repository.service';

describe('PlayersRepositoryService', () => {
  let service: PlayersRepositoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlayersRepositoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
