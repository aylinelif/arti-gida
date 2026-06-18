import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Reservation } from '../../models/reservation';
import { ReservationService } from '../../services/reservation.service';

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-reservations.html',
})
export class MyReservationsPage implements OnInit {
  reservations: Reservation[] = [];
  isLoading = true;

  constructor(private reservationService: ReservationService) {}

  ngOnInit(): void {
    this.reservationService.getMyReservations().subscribe({
      next: (data) => {
        this.reservations = data;
        this.isLoading = false;
      },
      error: () => {
        this.reservations = [];
        this.isLoading = false;
      },
    });
  }
}
