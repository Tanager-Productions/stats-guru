import { TestBed } from '@angular/core/testing';

import { GamecastService } from './gamecast.service';

describe('GamecastService', () => {
  let service: GamecastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GamecastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
