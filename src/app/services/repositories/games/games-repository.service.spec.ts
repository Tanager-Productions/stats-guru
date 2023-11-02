import { TestBed } from '@angular/core/testing';

import { GamesRepositoryService } from './games-repository.service';

describe('GamesRepositoryService', () => {
  let service: GamesRepositoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GamesRepositoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
