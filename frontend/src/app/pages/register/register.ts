import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { UserRole } from '../../models/user';
import { AuthService } from '../../services/auth.service';
import { getApiErrorMessage } from '../../utils/api-error';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
})
export class RegisterPage implements OnInit {
  name = '';
  email = '';
  password = '';
  role: UserRole = 'user';
  isLoading = false;
  errorMessage = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const roleParam = params['role'];
      if (roleParam === 'business' || roleParam === 'user') {
        this.role = roleParam;
      }
    });
  }

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
      error: (err) => {
        this.errorMessage = getApiErrorMessage(err, 'Kayıt başarısız. Bilgileri kontrol edin.');
        this.isLoading = false;
      },
      complete: () => (this.isLoading = false),
    });
  }
}
