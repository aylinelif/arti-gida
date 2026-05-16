import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { Reservation } from '../../models/reservation';
import { AuthService } from '../../services/auth.service';
import { ReservationService } from '../../services/reservation.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.html',
})
export class ProfilePage implements OnInit {
  reservations: Reservation[] = [];
  isLoading = true;
  loadError = false;

  constructor(
    public auth: AuthService,
    private reservationService: ReservationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    if (!this.auth.isLoggedIn) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/profile' } });
      return;
    }

    if (!this.auth.isCustomer) {
      this.isLoading = false;
      return;
    }

    this.loadReservations();
  }

  loadReservations(): void {
    this.isLoading = true;
    this.loadError = false;
    this.reservationService.getMyReservations().subscribe({
      next: (data) => {
        this.reservations = data;
        this.isLoading = false;
      },
      error: () => {
        this.loadError = true;
        this.isLoading = false;
      },
    });
  }
}
