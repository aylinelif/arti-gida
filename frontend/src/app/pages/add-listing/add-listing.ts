import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { ListingService } from '../../services/listing';
import { ToastService } from '../../services/toast.service';
import { getApiErrorMessage } from '../../utils/api-error';

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
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    if (!this.auth.isLoggedIn || !this.auth.isBusiness) {
      this.toast.warning('İlan eklemek için işletme hesabıyla giriş yapmalısınız.');
      this.router.navigate(['/login']);
    }
  }

  runAIPrediction(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!this.title.trim()) {
      this.toast.warning('Yapay zeka analizi için lütfen önce ilan başlığı girin.');
      return;
    }

    this.isAnalyzing = true;
    this.listingService.predictListingDetails(this.title, this.description).subscribe({
      next: (res) => {
        this.category = res.category;
        this.aiShelfLife = res.shelfLife;
        this.isAnalyzing = false;
        this.toast.success('Yapay zeka analizi başarıyla tamamlandı!');
      },
      error: (err) => {
        console.error('AI Tahmini başarısız:', err);
        this.toast.error('Yapay zeka analizi sırasında bir hata oluştu. Lütfen alanları manuel doldurun.');
        this.isAnalyzing = false;
      },
    });
  }

  submitForm(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!this.title || !this.category || !this.quantity || !this.pickupTime) {
      this.toast.warning('Lütfen tüm alanları doldurun.');
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
          this.toast.success('Harika! İlan başarıyla sisteme eklendi.');
          this.router.navigate(['/']);
        },
        error: (err) => {
          const msg = getApiErrorMessage(err, 'İlan eklenirken bir hata oluştu.');
          this.toast.error(msg);
          this.isSubmitting = false;
        },
      });
  }
}
