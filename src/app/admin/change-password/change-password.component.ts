import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-change-password',
  imports: [FormsModule, CommonModule],
  template: `
<div class="container py-5">
  <div class="cp-container">
    <div class="cp-card">
      <div class="text-center mb-4">
        <div class="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 p-3 rounded-circle mb-3">
          <i class="fa-solid fa-lock text-primary fs-3"></i>
        </div>
        <h3 class="fw-bold text-dark">Security Settings</h3>
        <p class="text-muted small">Update your administrator password regularly to keep your account secure.</p>
      </div>

      <div *ngIf="message()" class="alert border-0 rounded-3 py-2 small text-center mb-3"
        [class.alert-success]="!isError()" [class.alert-danger]="isError()">
        <i class="bi me-1" [class.bi-check-circle-fill]="!isError()" [class.bi-x-circle-fill]="isError()"></i>
        {{message()}}
      </div>

      <form (ngSubmit)="updatePassword()">
        <div class="mb-3">
          <label class="form-label fw-semibold small">Current Password</label>
          <input [type]="showPass ? 'text' : 'password'" [(ngModel)]="form.oldPass" name="oldPass" class="form-control" placeholder="••••••••" required>
        </div>
        <hr class="my-4 text-secondary opacity-25">
        <div class="mb-3">
          <label class="form-label fw-semibold small">New Password</label>
          <input [type]="showPass ? 'text' : 'password'" [(ngModel)]="form.newPass" name="newPass" class="form-control" placeholder="Enter new password" required>
          <div class="password-requirement"><i class="bi bi-info-circle me-1"></i> Use at least 6 characters.</div>
        </div>
        <div class="mb-4">
          <label class="form-label fw-semibold small">Confirm New Password</label>
          <input [type]="showPass ? 'text' : 'password'" [(ngModel)]="form.confirmPass" name="confirmPass" class="form-control" placeholder="Repeat new password" required>
        </div>
        <div class="form-check mb-4">
          <input class="form-check-input" type="checkbox" id="togglePass" [(ngModel)]="showPass" name="showPass">
          <label class="form-check-label small text-muted" for="togglePass">Show Passwords</label>
        </div>
        <button class="btn btn-success btn-update w-100 shadow-sm" [disabled]="loading()">
          <span *ngIf="!loading()"><i class="bi bi-check2-circle me-2"></i>Update Password</span>
          <span *ngIf="loading()"><i class="fa-solid fa-spinner fa-spin me-2"></i>Updating...</span>
        </button>
      </form>
    </div>
  </div>
</div>
  `,
  styles: [`
    .cp-container { max-width:550px; margin:2rem auto; }
    .cp-card { background:#fff; border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,0.08); border:1px solid #e2e8f0; padding:40px; }
    .btn-update { padding:12px; font-weight:600; border-radius:10px; background:linear-gradient(135deg,#10b981 0%,#059669 100%); border:none; transition:all 0.3s ease; }
    .btn-update:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 5px 15px rgba(16,185,129,0.4); }
    .btn-update:disabled { opacity:0.7; cursor:not-allowed; }
    .password-requirement { font-size:0.75rem; color:#94a3b8; margin-top:5px; }
  `]
})
export class ChangePasswordComponent {
  showPass = false;
  loading = signal(false);
  message = signal('');
  isError = signal(false);
  form = { oldPass: '', newPass: '', confirmPass: '' };

  constructor(private api: AdminApiService) {}

  updatePassword() {
    this.message.set(''); this.isError.set(false);
    if (this.form.newPass !== this.form.confirmPass) { this.message.set('New passwords do not match!'); this.isError.set(true); return; }
    if (this.form.newPass.length < 6) { this.message.set('Password must be at least 6 characters'); this.isError.set(true); return; }
    this.loading.set(true);
    this.api.changePassword(this.form.oldPass, this.form.newPass).subscribe({
      next: (res) => {
        this.form = { oldPass: '', newPass: '', confirmPass: '' };
        this.loading.set(false);
        (window as any).Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: res.message || 'Password updated!', showConfirmButton: false, timer: 3000 });
      },
      error: (err) => {
        this.message.set(err.error?.message || 'Failed to update password.');
        this.isError.set(true);
        this.loading.set(false);
      }
    });
  }
}
