import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { getApiErrorMessage } from '../../utils/api-error';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
})
export class LoginPage {
  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  submit(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.errorMessage = getApiErrorMessage(err, 'Giriş başarısız. E-posta veya şifreyi kontrol edin.');
        this.isLoading = false;
      },
      complete: () => (this.isLoading = false),
    });
  }
}
