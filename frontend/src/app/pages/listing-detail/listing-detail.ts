import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { FoodListing } from '../../models/food-listing';
import { AuthService } from '../../services/auth.service';
import { ListingService } from '../../services/listing';
import { ReservationService } from '../../services/reservation.service';
import { getApiErrorMessage } from '../../utils/api-error';

@Component({
  selector: 'app-listing-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './listing-detail.html',
})
export class ListingDetailPage implements OnInit {
  listing: FoodListing | null = null;
  isLoading = true;
  isReserving = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private listingService: ListingService,
    private reservationService: ReservationService,
    public auth: AuthService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.listingService.getListingById(id).subscribe({
      next: (data) => {
        this.listing = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'İlan bulunamadı.';
        this.isLoading = false;
      },
    });
  }

  reserve(): void {
    if (!this.listing) return;

    if (!this.auth.isLoggedIn) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/listings/${this.listing.id}` },
      });
      return;
    }

    if (!this.auth.isCustomer) {
      this.errorMessage = 'Rezervasyon için müşteri hesabıyla giriş yapın.';
      return;
    }

    if (this.listing.quantity <= 0) {
      this.errorMessage = 'Bu ilan için stok kalmamış.';
      return;
    }

    this.isReserving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.reservationService.create(this.listing.id).subscribe({
      next: () => {
        this.listing = {
          ...this.listing!,
          quantity: this.listing!.quantity - 1,
        };
        this.successMessage = `Rezervasyon başarılı! Ürününüzü ${this.listing.pickupTime} saatinde alabilirsiniz.`;
        this.isReserving = false;
      },
      error: (err) => {
        this.errorMessage = getApiErrorMessage(err, 'Rezervasyon yapılamadı.');
        this.isReserving = false;
      },
    });
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }
}
