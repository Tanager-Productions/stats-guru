import { TestBed } from '@angular/core/testing';

import { PlaysRepositoryService } from './plays-repository.service';

describe('PlaysRepositoryService', () => {
  let service: PlaysRepositoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlaysRepositoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
