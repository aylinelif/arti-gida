import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { FoodListing } from '../models/food-listing';
import { ListingCreate } from '../models/listing-create';

@Injectable({ providedIn: 'root' })
export class ListingService {
  private readonly baseUrl = `${environment.apiUrl}/listings`;

  constructor(private http: HttpClient) {}

  getActiveListings(): Observable<FoodListing[]> {
    return this.http.get<FoodListing[]>(`${this.baseUrl}/active`);
  }

  getAllListings(): Observable<FoodListing[]> {
    return this.http.get<FoodListing[]>(`${this.baseUrl}/`);
  }

  getListingById(id: number): Observable<FoodListing> {
    return this.http.get<FoodListing>(`${this.baseUrl}/${id}`);
  }

  createListing(payload: ListingCreate): Observable<FoodListing> {
    return this.http.post<FoodListing>(`${this.baseUrl}/`, payload);
  }

  buildPickupIso(pickupTime: string): string {
    const start = pickupTime.split('-')[0].trim();
    const [hours, minutes] = start.split(':').map((part) => Number(part));
    const date = new Date();
    date.setHours(hours, minutes || 0, 0, 0);
    return date.toISOString();
  }
}
