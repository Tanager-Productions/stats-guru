import { TestBed } from '@angular/core/testing';

import { UnitOfWorkService } from './unit-of-work.service';

describe('UnitOfWorkService', () => {
  let service: UnitOfWorkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnitOfWorkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
