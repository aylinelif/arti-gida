import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FoodListing } from '../../models/food-listing';
import { ListingService } from '../../services/listing';
import { ListingCardComponent } from '../../components/listing-card/listing-card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ListingCardComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  listings: FoodListing[] = [];

  constructor(private listingService: ListingService) {}

  ngOnInit(): void {
    this.listingService.getMockListings().subscribe(data => {
      this.listings = data;
    });
  }
}