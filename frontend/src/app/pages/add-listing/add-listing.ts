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
  imageUrl = '';
  aiShelfLife = '12 Saat';
  isAnalyzing = false;
  isSubmitting = false;

  imagePresets = [
    { label: 'Unlu Mamül', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600' },
    { label: 'Yemek', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600' },
    { label: 'Tatlı', url: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600' },
    { label: 'Meyve/Sebze', url: 'https://images.unsplash.com/photo-1610832958506-ee5633619144?w=600' },
    { label: 'Süt Ürünü', url: 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=600' },
    { label: 'İçecek', url: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=600' },
    { label: 'Diğer', url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600' }
  ];

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

  selectPresetImage(url: string): void {
    this.imageUrl = url;
  }

  onImageError(): void {
    this.toast.error('Geçersiz görsel URL\'si. Lütfen çalışan bir bağlantı girin.');
    this.imageUrl = '';
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
        image_url: this.imageUrl || undefined,
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
