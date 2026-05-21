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
  filteredListings: FoodListing[] = [];
  searchQuery = '';
  selectedCategory = '';
  isLoading = true;
  loadError = false;

  categories = [
    { name: 'Unlu Mamül', label: 'Unlu Mamüller', emoji: '🥐' },
    { name: 'Yemek', label: 'Yemekler', emoji: '🍲' },
    { name: 'Tatlı', label: 'Tatlılar', emoji: '🍰' },
    { name: 'Meyve/Sebze', label: 'Meyve & Sebze', emoji: '🥬' },
    { name: 'Süt Ürünü', label: 'Süt Ürünleri', emoji: '🧀' },
    { name: 'İçecek', label: 'İçecekler', emoji: '🥤' }
  ];

  private listingService = inject(ListingService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadListings();
  }

  filterListings(): void {
    const query = this.searchQuery.toLowerCase().trim();
    this.filteredListings = this.listings.filter((item) => {
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        item.establishmentName.toLowerCase().includes(query) ||
        item.aiCategory.toLowerCase().includes(query);

      const matchesCategory =
        !this.selectedCategory ||
        item.aiCategory.toLowerCase() === this.selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }

  selectCategory(category: string): void {
    if (this.selectedCategory === category) {
      this.selectedCategory = ''; // Deselect if already selected
    } else {
      this.selectedCategory = category;
    }
    this.filterListings();
  }

  onSearch(query: string): void {
    this.searchQuery = query;
    this.filterListings();
  }

  loadListings(): void {
    this.isLoading = true;
    this.loadError = false;

    this.listingService.getActiveListings().subscribe({
      next: (data) => {
        this.listings = data;
        this.filterListings();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.listingService.getAllListings().subscribe({
          next: (data) => {
            this.listings = data;
            this.filterListings();
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
