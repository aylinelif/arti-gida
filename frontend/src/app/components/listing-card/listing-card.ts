import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { FoodListing } from '../../models/food-listing';
import { AuthService } from '../../services/auth.service';
import { ReservationService } from '../../services/reservation.service';
import { getApiErrorMessage } from '../../utils/api-error';

@Component({
  selector: 'app-listing-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './listing-card.html',
  styleUrl: './listing-card.scss',
})
export class ListingCardComponent {
  @Input() listing!: FoodListing;

  isReserving = false;
  reserveMessage = '';

  constructor(
    private auth: AuthService,
    private reservationService: ReservationService,
    private router: Router,
  ) {}

  reserve(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.auth.isLoggedIn) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/listings/${this.listing.id}` },
      });
      return;
    }

    if (!this.auth.isCustomer) {
      alert('Rezervasyon için müşteri hesabıyla giriş yapın.');
      return;
    }

    if (this.listing.quantity <= 0) {
      alert('Bu ilan için stok kalmamış.');
      return;
    }

    this.isReserving = true;
    this.reserveMessage = '';

    this.reservationService.create(this.listing.id).subscribe({
      next: () => {
        this.isReserving = false;
        this.listing = { ...this.listing, quantity: this.listing.quantity - 1 };
        const goProfile = confirm(
          `Rezervasyon başarılı! Ürününüzü ${this.listing.pickupTime} saatinde alabilirsiniz.\n\nProfilinizde görmek ister misiniz?`,
        );
        if (goProfile) {
          this.router.navigate(['/profile']);
        }
      },
      error: (err) => {
        this.isReserving = false;
        alert(getApiErrorMessage(err, 'Rezervasyon yapılamadı.'));
      },
    });
  }
}
