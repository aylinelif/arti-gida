import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { BusinessReservation, Reservation, ReservationStatus } from '../../models/reservation';
import { AuthService } from '../../services/auth.service';
import { ReservationService } from '../../services/reservation.service';
import { ToastService } from '../../services/toast.service';
import { getApiErrorMessage } from '../../utils/api-error';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './profile.html',
})
export class ProfilePage implements OnInit {
  reservations: Reservation[] = [];
  businessReservations: BusinessReservation[] = [];
  isLoading = true;
  loadError = false;

  isEditing = false;
  editName = '';
  editEmail = '';
  editPassword = '';
  editProfilePictureUrl = '';
  isSaving = false;
  updateSuccess = '';
  updateError = '';

  avatars: string[] = [
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Ayse',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Lucky',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=plant',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=earth',
    'https://api.dicebear.com/7.x/bottts/svg?seed=green',
    'https://api.dicebear.com/7.x/identicon/svg?seed=eco'
  ];

  constructor(
    public auth: AuthService,
    private reservationService: ReservationService,
    private router: Router,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    if (!this.auth.isLoggedIn) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/profile' } });
      return;
    }

    const user = this.auth.currentUser();
    if (user) {
      this.editName = user.name;
      this.editEmail = user.email;
      this.editProfilePictureUrl = user.profilePictureUrl || '';
    }

    if (this.auth.isBusiness) {
      this.loadBusinessReservations();
    } else {
      this.loadReservations();
    }
  }

  selectAvatar(avatarUrl: string): void {
    this.editProfilePictureUrl = avatarUrl;
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      const user = this.auth.currentUser();
      if (user) {
        this.editName = user.name;
        this.editEmail = user.email;
        this.editPassword = '';
        this.editProfilePictureUrl = user.profilePictureUrl || '';
      }
      this.updateSuccess = '';
      this.updateError = '';
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.updateSuccess = '';
    this.updateError = '';
  }

  saveProfile(): void {
    if (!this.editName.trim() || !this.editEmail.trim()) {
      this.updateError = 'Ad Soyad ve E-posta alanları zorunludur.';
      return;
    }

    this.isSaving = true;
    this.updateSuccess = '';
    this.updateError = '';

    const payload: { name: string; email: string; password?: string; profilePictureUrl?: string } = {
      name: this.editName,
      email: this.editEmail,
      profilePictureUrl: this.editProfilePictureUrl
    };

    if (this.editPassword.trim()) {
      payload.password = this.editPassword;
    }

    this.auth.updateProfile(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.isEditing = false;
        this.updateSuccess = 'Profil bilgileriniz başarıyla güncellendi.';
        setTimeout(() => this.updateSuccess = '', 5000);
      },
      error: (err) => {
        this.isSaving = false;
        this.updateError = getApiErrorMessage(err, 'Profil güncellenirken bir hata oluştu.');
      }
    });
  }

  loadReservations(): void {
    this.isLoading = this.reservations.length === 0;
    this.loadError = false;
    this.reservationService.getMyReservations().subscribe({
      next: (data) => {
        this.reservations = data;
        this.isLoading = false;
      },
      error: () => {
        this.loadError = true;
        this.isLoading = false;
      },
    });
  }

  loadBusinessReservations(): void {
    this.isLoading = this.businessReservations.length === 0;
    this.loadError = false;
    this.reservationService.getBusinessReservations().subscribe({
      next: (data) => {
        this.businessReservations = data;
        this.isLoading = false;
      },
      error: () => {
        this.loadError = true;
        this.isLoading = false;
      },
    });
  }

  updateReservationStatus(id: number, status: ReservationStatus): void {
    const actionText = status === 'completed' ? 'Tamamlandı' : 'İptal';
    const confirmChange = confirm(`Rezervasyon durumunu "${actionText}" olarak değiştirmek istediğinize emin misiniz?`);
    if (!confirmChange) return;

    this.reservationService.updateStatus(id, status).subscribe({
      next: () => {
        this.toast.success(`Rezervasyon durumu başarıyla "${actionText}" olarak güncellendi.`);
        if (this.auth.isBusiness) {
          this.loadBusinessReservations();
        } else {
          this.loadReservations();
        }
      },
      error: (err) => {
        this.toast.error(getApiErrorMessage(err, 'Rezervasyon durumu güncellenemedi.'));
      },
    });
  }

  // --- Customer Gamification Getters ---
  get totalRescuedMeals(): number {
    return this.reservations.filter(r => r.status === 'completed' || r.status === 'pending').length;
  }

  get moneySaved(): number {
    return this.totalRescuedMeals * 120; // 120 TL average saved per meal
  }

  get co2Saved(): number {
    return Number((this.totalRescuedMeals * 2.2).toFixed(1));
  }

  get waterSaved(): number {
    return this.totalRescuedMeals * 1000;
  }

  get ecoBadge(): { name: string; icon: string; desc: string; color: string } {
    const count = this.totalRescuedMeals;
    if (count === 0) return { name: 'Tohum', icon: '🌱', desc: 'İlk rezervasyonunu yap ve israfı önlemeye başla!', color: 'bg-gray-100 text-gray-500 border-gray-200' };
    if (count < 3) return { name: 'Filiz', icon: '🌿', desc: 'Harika bir başlangıç! Çevre dostu adımlar atıyorsun.', color: 'bg-green-50 text-green-700 border-green-200' };
    if (count < 7) return { name: 'Doğa Dostu', icon: '🌳', desc: 'Gıda israfına karşı harika bir bilinç sergiliyorsun!', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (count < 12) return { name: 'Karbon Savaşçısı', icon: '⚡', desc: 'İklim krizine karşı aktif mücadele veriyorsun!', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { name: 'Yeşil Kahraman', icon: '👑', desc: 'Dünyayı daha yaşanabilir kılmak için mükemmel bir katkı sağladın!', color: 'bg-purple-50 text-purple-700 border-purple-200' };
  }

  // --- Business Gamification Getters ---
  get totalBusinessRescued(): number {
    return this.businessReservations.filter(r => r.status === 'completed').length;
  }

  get businessCo2Saved(): number {
    return Number((this.totalBusinessRescued * 2.2).toFixed(1));
  }

  get businessWaterSaved(): number {
    return this.totalBusinessRescued * 1000;
  }

  get businessBadge(): { name: string; icon: string; desc: string; color: string } {
    const count = this.totalBusinessRescued;
    if (count === 0) return { name: 'Yeşil Üye', icon: '🍃', desc: 'Platforma hoş geldiniz! İlan ekleyerek başlayın.', color: 'bg-gray-100 text-gray-500 border-gray-200' };
    if (count < 5) return { name: 'Sıfır Atık Öncüsü', icon: '♻️', desc: 'Atık kontrolüne katkı sağlamaya başladınız!', color: 'bg-green-50 text-green-700 border-green-200' };
    if (count < 15) return { name: 'Gezegen Koruyucusu', icon: '🌍', desc: 'Çevresel sürdürülebilirliğe harika destek oluyorsunuz.', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    return { name: 'Sürdürülebilirlik Şampiyonu', icon: '🏆', desc: 'İsrafı sıfırlayarak bölgede yeşil bir rol model oldunuz!', color: 'bg-amber-50 text-amber-700 border-amber-200' };
  }
}
