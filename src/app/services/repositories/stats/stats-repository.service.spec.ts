import { TestBed } from '@angular/core/testing';

import { StatsRepositoryService } from './stats-repository.service';

describe('StatsRepositoryService', () => {
  let service: StatsRepositoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StatsRepositoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
