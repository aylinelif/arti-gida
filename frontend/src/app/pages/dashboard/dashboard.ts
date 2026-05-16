import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FoodListing } from '../../models/food-listing';
import { ListingService } from '../../services/listing';
import { ListingCardComponent } from '../../components/listing-card/listing-card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ListingCardComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit {
  listings: FoodListing[] = [];
  isLoading = true;
  loadError = false;

  private listingService = inject(ListingService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadListings();
  }

  loadListings(): void {
    this.isLoading = true;
    this.loadError = false;

    this.listingService.getActiveListings().subscribe({
      next: (data) => {
        this.listings = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.listingService.getAllListings().subscribe({
          next: (data) => {
            this.listings = data;
            this.isLoading = false;
            this.loadError = false;
            this.cdr.detectChanges();
          },
          error: () => {
            this.isLoading = false;
            this.loadError = true;
            this.cdr.detectChanges();
          },
        });
      },
    });
  }
}
