import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { AddListing } from './add-listing';

describe('AddListing', () => {
  let component: AddListing;
  let fixture: ComponentFixture<AddListing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddListing],
      providers: [
        provideRouter([
          { path: 'login', redirectTo: '' }
        ]),
        provideHttpClient()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddListing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
