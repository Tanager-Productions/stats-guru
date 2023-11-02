import { TestBed } from '@angular/core/testing';

import { TeamsRepositoryService } from './teams-repository.service';

describe('TeamsRepositoryService', () => {
  let service: TeamsRepositoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TeamsRepositoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
