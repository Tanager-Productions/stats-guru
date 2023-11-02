import { TestBed } from '@angular/core/testing';

import { SeasonsRepositoryService } from './seasons-repository.service';

describe('SeasonsRepositoryService', () => {
  let service: SeasonsRepositoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeasonsRepositoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
