import { TestBed } from '@angular/core/testing';

import { SyncHistoryRepositoryService } from './sync-history-repository.service';

describe('SyncHistoryRepositoryService', () => {
  let service: SyncHistoryRepositoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SyncHistoryRepositoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
