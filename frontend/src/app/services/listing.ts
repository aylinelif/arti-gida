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
    return this.http.get<FoodListing[]>(`${this.baseUrl}`);
  }

  getListingById(id: number): Observable<FoodListing> {
    return this.http.get<FoodListing>(`${this.baseUrl}/${id}`);
  }

  createListing(payload: ListingCreate): Observable<FoodListing> {
    return this.http.post<FoodListing>(`${this.baseUrl}`, payload);
  }

  predictListingDetails(title: string, description: string): Observable<{ category: string; shelfLife: string }> {
    return this.http.post<{ category: string; shelfLife: string }>(`${this.baseUrl}/predict`, { title, description });
  }

  buildPickupIso(pickupTime: string): string {
    try {
      if (!pickupTime) {
        throw new Error('Empty pickupTime');
      }
      // Extract the start time, e.g. "19:00 - 20:30" -> "19:00" or "19.00" -> "19.00"
      const start = pickupTime.split('-')[0].trim();
      // Replace dot separator with colon just in case, e.g. "19.00" -> "19:00"
      const normalized = start.replace('.', ':');
      const parts = normalized.split(':').map((part) => Number(part.trim()));
      const hours = parts[0];
      const minutes = parts[1];
      
      const date = new Date();
      if (!isNaN(hours) && hours >= 0 && hours < 24) {
        date.setHours(hours, isNaN(minutes) || minutes < 0 || minutes >= 60 ? 0 : minutes, 0, 0);
      } else {
        // Fallback: 3 hours from now
        date.setHours(date.getHours() + 3);
      }
      return date.toISOString();
    } catch {
      const date = new Date();
      date.setHours(date.getHours() + 3);
      return date.toISOString();
    }
  }
}
