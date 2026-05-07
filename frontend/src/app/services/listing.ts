import { Injectable } from '@angular/core';
import { FoodListing } from '../models/food-listing';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ListingService {
  private mockListings: FoodListing[] = [
    {
      id: 1,
      establishmentName: 'Kampüs Fırın',
      title: 'Peynirli Poğaça ve Simit Paketi',
      quantity: 5,
      pickupTime: '20:00 - 21:00',
      aiCategory: 'Unlu Mamül',
      aiShelfLife: '12 Saat',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500'
    },
    {
      id: 2,
      establishmentName: 'Ev Yemekleri Lokantası',
      title: 'Kalan Sulu Yemek Porsiyonları',
      quantity: 3,
      pickupTime: '21:30 - 22:30',
      aiCategory: 'Ana Yemek',
      aiShelfLife: '24 Saat',
      imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500'
    }
  ];

  constructor() { }

  getMockListings(): Observable<FoodListing[]> {
    return of(this.mockListings);
  }
}