import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { DashboardComponent } from './dashboard';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter listings based on search query', () => {
    component.listings = [
      { id: 1, title: 'Simit Paketi', establishmentName: 'Fırın', quantity: 2, pickupTime: '12:00', aiCategory: 'Unlu Mamül', aiShelfLife: '12 Saat', imageUrl: '' },
      { id: 2, title: 'Mercimek Çorbası', establishmentName: 'Lokanta', quantity: 1, pickupTime: '13:00', aiCategory: 'Yemek', aiShelfLife: '24 Saat', imageUrl: '' }
    ];
    component.onSearch('çorba');
    expect(component.filteredListings.length).toBe(1);
    expect(component.filteredListings[0].id).toBe(2);
  });

  it('should filter listings based on category selection', () => {
    component.listings = [
      { id: 1, title: 'Simit Paketi', establishmentName: 'Fırın', quantity: 2, pickupTime: '12:00', aiCategory: 'Unlu Mamül', aiShelfLife: '12 Saat', imageUrl: '' },
      { id: 2, title: 'Mercimek Çorbası', establishmentName: 'Lokanta', quantity: 1, pickupTime: '13:00', aiCategory: 'Yemek', aiShelfLife: '24 Saat', imageUrl: '' }
    ];
    component.selectCategory('Unlu Mamül');
    expect(component.filteredListings.length).toBe(1);
    expect(component.filteredListings[0].id).toBe(1);
  });

  it('should toggle category selection when clicked twice', () => {
    component.listings = [
      { id: 1, title: 'Simit Paketi', establishmentName: 'Fırın', quantity: 2, pickupTime: '12:00', aiCategory: 'Unlu Mamül', aiShelfLife: '12 Saat', imageUrl: '' },
      { id: 2, title: 'Mercimek Çorbası', establishmentName: 'Lokanta', quantity: 1, pickupTime: '13:00', aiCategory: 'Yemek', aiShelfLife: '24 Saat', imageUrl: '' }
    ];
    
    // Select category first time
    component.selectCategory('Yemek');
    expect(component.selectedCategory).toBe('Yemek');
    expect(component.filteredListings.length).toBe(1);

    // Select category second time (should deselect)
    component.selectCategory('Yemek');
    expect(component.selectedCategory).toBe('');
    expect(component.filteredListings.length).toBe(2);
  });
});

