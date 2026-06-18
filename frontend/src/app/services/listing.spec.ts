import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { ListingService } from './listing';

describe('ListingService', () => {
  let service: ListingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
    service = TestBed.inject(ListingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
