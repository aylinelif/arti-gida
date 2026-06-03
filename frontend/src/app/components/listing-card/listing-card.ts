import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { FoodListing } from '../../models/food-listing';
import { AuthService } from '../../services/auth.service';
import { ReservationService } from '../../services/reservation.service';
import { ToastService } from '../../services/toast.service';
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
    public auth: AuthService,
    private reservationService: ReservationService,
    private router: Router,
    private toast: ToastService,
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
      this.toast.warning('Rezervasyon için müşteri hesabıyla giriş yapın.');
      return;
    }

    if (this.listing.quantity <= 0) {
      this.toast.warning('Bu ilan için stok kalmamış.');
      return;
    }

    this.isReserving = true;
    this.reserveMessage = '';

    this.reservationService.create(this.listing.id).subscribe({
      next: () => {
        this.isReserving = false;
        this.listing = { ...this.listing, quantity: this.listing.quantity - 1 };
        this.toast.success(`Rezervasyon başarılı! Profilinize yönlendiriliyorsunuz.`);
        setTimeout(() => {
          this.router.navigate(['/profile']);
        }, 1500);
      },
      error: (err) => {
        this.isReserving = false;
        this.toast.error(getApiErrorMessage(err, 'Rezervasyon yapılamadı.'));
      },
    });
  }

  messageSeller(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    this.router.navigate(['/messages'], {
      queryParams: {
        otherUserId: this.listing.businessId,
        listingId: this.listing.id,
        listingTitle: this.listing.title,
      },
    });
  }
}
