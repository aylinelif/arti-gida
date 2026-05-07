import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-listing',
  standalone: true,
  imports: [CommonModule, FormsModule], // Form modülünü ekledik
  templateUrl: './add-listing.html'
})
export class AddListing {
  // Formda tutacağımız veriler
  title: string = '';
  category: string = '';
  quantity: number | null = null;
  pickupTime: string = '';

  // Animasyon kontrolü
  isAnalyzing: boolean = false;

  constructor(private router: Router) {}

  // Yapay zeka butonuna basınca çalışacak fonksiyon
  simulateAI() {
    this.isAnalyzing = true; // Yükleniyor animasyonunu başlat
    
    // 1.5 saniye bekle (Modelin resmi analiz etme süresi gibi düşün)
    setTimeout(() => {
      this.title = 'Taze Fırın Simit ve Poğaça Paketi';
      this.category = 'Unlu Mamül';
      this.quantity = 5;
      this.pickupTime = '19:00 - 20:30';
      this.isAnalyzing = false; // Animasyonu bitir
    }, 1500);
  }

  // Yayınla butonuna basınca çalışacak fonksiyon
  submitForm() {
    alert('Harika! İlan başarıyla sisteme eklendi.');
    // İleride burası senin yazacağın Backend API'sine verileri gönderecek.
    // Şimdilik sadece kullanıcıyı ana sayfaya geri yönlendiriyoruz:
    this.router.navigate(['/']);
  }
}