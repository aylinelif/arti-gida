import { Component, Input } from '@angular/core';
import { FoodListing } from '../../models/food-listing';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-listing-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './listing-card.html',
  styleUrl: './listing-card.scss'
})
export class ListingCardComponent {
  @Input() listing!: FoodListing;
}