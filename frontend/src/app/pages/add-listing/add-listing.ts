import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { ListingService } from '../../services/listing';

@Component({
  selector: 'app-add-listing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-listing.html',
})
export class AddListing implements OnInit {
  title = '';
  category = '';
  quantity: number | null = null;
  pickupTime = '';
  description = '';
  aiShelfLife = '12 Saat';
  isAnalyzing = false;
  isSubmitting = false;

  constructor(
    private router: Router,
    private listingService: ListingService,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    if (!this.auth.isLoggedIn || !this.auth.isBusiness) {
      alert('İlan eklemek için işletme hesabıyla giriş yapmalısınız.');
      this.router.navigate(['/login']);
    }
  }

  simulateAI(): void {
    this.isAnalyzing = true;
    setTimeout(() => {
      this.title = 'Taze Fırın Simit ve Poğaça Paketi';
      this.category = 'Unlu Mamül';
      this.quantity = 5;
      this.pickupTime = '19:00 - 20:30';
      this.aiShelfLife = '12 Saat';
      this.description = 'Gün sonu taze unlu mamül paketi.';
      this.isAnalyzing = false;
    }, 1500);
  }

  submitForm(): void {
    if (!this.title || !this.category || !this.quantity || !this.pickupTime) {
      alert('Lütfen tüm alanları doldurun.');
      return;
    }

    this.isSubmitting = true;
    this.listingService
      .createListing({
        title: this.title,
        description: this.description || undefined,
        category: this.category,
        quantity: this.quantity,
        pickup_time: this.listingService.buildPickupIso(this.pickupTime),
        ai_shelf_life: this.aiShelfLife,
      })
      .subscribe({
        next: () => {
          alert('Harika! İlan başarıyla sisteme eklendi.');
          this.router.navigate(['/']);
        },
        error: (err) => {
          const msg = err.error?.detail || 'İlan eklenirken bir hata oluştu.';
          alert(msg);
          this.isSubmitting = false;
        },
      });
  }
}
