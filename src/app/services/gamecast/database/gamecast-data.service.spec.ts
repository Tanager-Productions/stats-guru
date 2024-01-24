import { TestBed } from '@angular/core/testing';

import { GamecastDataService } from './gamecast-data.service';

describe('GamecastDataService', () => {
  let service: GamecastDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GamecastDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
