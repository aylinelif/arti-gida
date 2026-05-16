import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { UserRole } from '../../models/user';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
})
export class RegisterPage {
  name = '';
  email = '';
  password = '';
  role: UserRole = 'user';
  isLoading = false;
  errorMessage = '';

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  submit(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.auth.register({
      name: this.name,
      email: this.email,
      password: this.password,
      role: this.role,
    }).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => {
        this.errorMessage = 'Kayıt başarısız. Bilgileri kontrol edin.';
        this.isLoading = false;
      },
      complete: () => (this.isLoading = false),
    });
  }
}
