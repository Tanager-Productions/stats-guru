import { TestBed } from '@angular/core/testing';

import { EventsRepositoryService } from './events-repository.service';

describe('EventsRepositoryService', () => {
  let service: EventsRepositoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventsRepositoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
