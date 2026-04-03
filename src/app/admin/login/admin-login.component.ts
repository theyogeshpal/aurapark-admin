import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AdminAuthService } from '../../services/admin-auth.service';

@Component({
  selector: 'app-admin-login',
  imports: [FormsModule, CommonModule, RouterLink],
  template: `
<div class="login-wrapper d-flex align-items-center justify-content-center min-vh-100">
  <div class="login-card shadow-lg">
    <div class="text-center mb-4">
      <div class="brand-icon mb-3">🅿</div>
      <h3 class="fw-bold">Aura Park</h3>
      <p class="text-muted small">Admin Panel Login</p>
    </div>

    <div *ngIf="error()" class="alert alert-danger py-2 small border-0 rounded-3 mb-3">
      <i class="fa-solid fa-circle-exclamation me-2"></i>{{error()}}
    </div>

    <form (ngSubmit)="login()">
      <div class="mb-3">
        <label class="form-label fw-semibold small">Email</label>
        <div class="input-group">
          <span class="input-group-text bg-light border-end-0"><i class="bi bi-person"></i></span>
          <input type="email" class="form-control border-start-0 bg-light" [(ngModel)]="form.email" name="email" placeholder="admin@aurapark.in" required>
        </div>
      </div>
      <div class="mb-4">
        <label class="form-label fw-semibold small">Password</label>
        <div class="input-group">
          <span class="input-group-text bg-light border-end-0"><i class="bi bi-lock"></i></span>
          <input type="password" class="form-control border-start-0 bg-light" [(ngModel)]="form.password" name="password" placeholder="••••••••" required>
        </div>
      </div>
      <button type="submit" class="btn btn-primary w-100 py-2 fw-bold" [disabled]="loading()">
        <span *ngIf="!loading()">Login to Admin Panel <i class="bi bi-arrow-right ms-1"></i></span>
        <span *ngIf="loading()"><i class="fa-solid fa-spinner fa-spin me-2"></i>Logging in...</span>
      </button>
      <div class="text-center mt-3">
        <a routerLink="/superadmin/login" class="small text-muted">Super Admin? Login here</a>
      </div>
    </form>
  </div>
</div>
  `,
  styles: [`
    .login-wrapper { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .login-card { background: white; border-radius: 20px; padding: 40px; width: 100%; max-width: 420px; }
    .brand-icon { font-size: 3rem; }
  `]
})
export class AdminLoginComponent {
  form = { email: '', password: '' };
  loading = signal(false);
  error = signal('');

  constructor(private auth: AdminAuthService, private router: Router) {}

  login() {
    this.error.set('');
    this.loading.set(true);
    this.auth.adminLogin(this.form.email, this.form.password).subscribe({
      next: () => this.router.navigate(['/admin/dashboard']),
      error: (err) => { this.error.set(err.error?.message || 'Invalid credentials'); this.loading.set(false); }
    });
  }
}
