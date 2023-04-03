import { TestBed } from '@angular/core/testing';

import { TgsDatabaseService } from './tgs-database.service';

describe('TgsDatabaseService', () => {
  let service: TgsDatabaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TgsDatabaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
