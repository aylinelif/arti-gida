import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { ListingCardComponent } from './listing-card';

describe('ListingCardComponent', () => {
  let component: ListingCardComponent;
  let fixture: ComponentFixture<ListingCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListingCardComponent],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(ListingCardComponent);
    component = fixture.componentInstance;
    component.listing = {
      id: 1,
      establishmentName: 'Kampüs Fırın',
      title: 'Peynirli Poğaça',
      description: 'Poğaça',
      quantity: 5,
      pickupTime: '19:00',
      aiCategory: 'Unlu Mamül',
      aiShelfLife: '12 Saat',
      imageUrl: '',
      isActive: true
    };
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
