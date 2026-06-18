import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { BusinessReservation, Reservation, ReservationStatus } from '../models/reservation';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly baseUrl = `${environment.apiUrl}/reservations`;

  private myReservationsSubject = new BehaviorSubject<Reservation[]>([]);
  private businessReservationsSubject = new BehaviorSubject<BusinessReservation[]>([]);

  constructor(private http: HttpClient) {}

  create(listingId: number): Observable<Reservation> {
    return this.http.post<Reservation>(`${this.baseUrl}`, { listing_id: listingId }).pipe(
      tap(() => {
        this.refreshMyReservations().subscribe();
      })
    );
  }

  getMyReservations(useCache = true): Observable<Reservation[]> {
    if (useCache && this.myReservationsSubject.value.length > 0) {
      this.refreshMyReservations().subscribe();
      return this.myReservationsSubject.asObservable();
    }
    return this.refreshMyReservations();
  }

  refreshMyReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.baseUrl}/my-reservations`).pipe(
      tap(data => this.myReservationsSubject.next(data))
    );
  }

  getBusinessReservations(useCache = true): Observable<BusinessReservation[]> {
    if (useCache && this.businessReservationsSubject.value.length > 0) {
      this.refreshBusinessReservations().subscribe();
      return this.businessReservationsSubject.asObservable();
    }
    return this.refreshBusinessReservations();
  }

  refreshBusinessReservations(): Observable<BusinessReservation[]> {
    return this.http.get<BusinessReservation[]>(`${this.baseUrl}/business`).pipe(
      tap(data => this.businessReservationsSubject.next(data))
    );
  }

  updateStatus(id: number, status: ReservationStatus): Observable<{ detail: string; status: ReservationStatus }> {
    return this.http.put<{ detail: string; status: ReservationStatus }>(`${this.baseUrl}/${id}/status`, { status }).pipe(
      tap(() => {
        this.refreshMyReservations().subscribe();
        this.refreshBusinessReservations().subscribe();
      })
    );
  }

  clearCache(): void {
    this.myReservationsSubject.next([]);
    this.businessReservationsSubject.next([]);
  }
}
