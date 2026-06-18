import { ChangeDetectorRef, Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

import { FoodListing } from '../../models/food-listing';
import { ListingService } from '../../services/listing';
import { ListingCardComponent } from '../../components/listing-card/listing-card';

declare const L: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ListingCardComponent, RouterLink],
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

  private map: any;
  private markers: any[] = [];
  private platformId = inject(PLATFORM_ID);

  private loadLeaflet(): Promise<void> {
    if (typeof window === 'undefined') return Promise.resolve();
    if ((window as any).L) return Promise.resolve();

    return new Promise((resolve, reject) => {
      // Load CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);

      // Load JS
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = '';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Leaflet load failed'));
      document.head.appendChild(script);
    });
  }

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

    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.initMap();
        this.updateMapMarkers();
      }, 100);
    }
  }

  initMap(): void {
    if (this.map) return;
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    this.loadLeaflet().then(() => {
      try {
        if (this.map) return;
        this.map = L.map('map', {
          scrollWheelZoom: false
        }).setView([41.4510, 31.7985], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap'
        }).addTo(this.map);

        this.updateMapMarkers();
      } catch (e) {
        console.error('Harita yüklenirken hata oluştu:', e);
      }
    }).catch(err => console.error(err));
  }

  updateMapMarkers(): void {
    if (!this.map || typeof L === 'undefined') return;
    try {
      this.markers.forEach(marker => this.map.removeLayer(marker));
      this.markers = [];

      this.filteredListings.forEach(item => {
        if (item.latitude && item.longitude && item.quantity > 0) {
          const popupContent = `
            <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width: 180px; padding: 4px;">
              <img src="${item.imageUrl || 'https://placehold.co/200x120?text=ArtiGida'}" style="width: 100%; height: 90px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;">
              <div style="font-weight: 800; font-size: 13px; color: #14532d; margin-bottom: 2px;">${item.title}</div>
              <div style="font-size: 11px; color: #6b7280; margin-bottom: 8px;">📍 ${item.establishmentName}</div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 700; font-size: 11px; color: #16a34a; background-color: #f0fdf4; padding: 2px 6px; border-radius: 4px;">${item.quantity} Adet</span>
                <a href="/listings/${item.id}" style="background-color: #16a34a; color: white; padding: 4px 8px; border-radius: 6px; font-weight: 700; font-size: 10px; text-decoration: none; display: inline-block;">İncele</a>
              </div>
            </div>
          `;

          const marker = L.marker([item.latitude, item.longitude])
            .addTo(this.map)
            .bindPopup(popupContent);
          
          this.markers.push(marker);
        }
      });
    } catch (e) {
      console.error('Marker güncellenirken hata oluştu:', e);
    }
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
