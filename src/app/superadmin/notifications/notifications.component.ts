import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-notifications',
  imports: [CommonModule, FormsModule],
  template: `
<div class="container-fluid py-4">
  <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
    <div>
      <h1 class="h3 fw-bold mb-1">Send Notification</h1>
      <p class="text-muted small mb-0">Broadcast messages to admins, users or both</p>
    </div>
  </div>

  <div class="row g-4">
    <!-- Send Form -->
    <div class="col-lg-5">
      <div class="notif-form-card">
        <h5 class="fw-bold mb-4"><i class="fa-solid fa-paper-plane me-2 text-primary"></i>Compose Notification</h5>
        <div class="mb-3">
          <label class="field-label">Title <span class="text-danger">*</span></label>
          <input type="text" class="field-input" [(ngModel)]="form.title" placeholder="e.g. System Maintenance Alert">
        </div>
        <div class="mb-3">
          <label class="field-label">Message <span class="text-danger">*</span></label>
          <textarea class="field-input" rows="4" [(ngModel)]="form.message" placeholder="Write your notification message here..."></textarea>
        </div>
        <div class="mb-4">
          <label class="field-label">Send To <span class="text-danger">*</span></label>
          <div class="d-flex gap-2 mt-2">
            <div class="target-btn" [class.active]="form.target==='admin'" (click)="form.target='admin'">
              <i class="fa-solid fa-user-tie me-2"></i>Admins Only
            </div>
            <div class="target-btn" [class.active]="form.target==='user'" (click)="form.target='user'">
              <i class="fa-solid fa-users me-2"></i>Users Only
            </div>
            <div class="target-btn" [class.active]="form.target==='both'" (click)="form.target='both'">
              <i class="fa-solid fa-globe me-2"></i>Both
            </div>
          </div>
        </div>
        <button class="btn btn-primary w-100 py-3 fw-bold" (click)="send()" [disabled]="sending()">
          <span *ngIf="!sending()"><i class="fa-solid fa-paper-plane me-2"></i>Send Notification</span>
          <span *ngIf="sending()"><i class="fa-solid fa-spinner fa-spin me-2"></i>Sending...</span>
        </button>
      </div>
    </div>

    <!-- Sent History -->
    <div class="col-lg-7">
      <div class="notif-history-card">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h5 class="fw-bold mb-0"><i class="fa-solid fa-clock-rotate-left me-2 text-primary"></i>Sent History</h5>
          <span class="badge bg-primary rounded-pill">{{notifications().length}}</span>
        </div>

        <div *ngIf="loading()" class="text-center py-5"><div class="spinner-border text-primary"></div></div>

        <div *ngIf="!loading() && notifications().length === 0" class="text-center py-5 text-muted">
          <i class="fa-solid fa-bell-slash d-block fs-1 mb-3 opacity-25"></i>
          <p>No notifications sent yet.</p>
        </div>

        <div *ngFor="let n of notifications()" class="notif-item">
          <div class="d-flex justify-content-between align-items-start gap-2">
            <div class="flex-grow-1 overflow-hidden">
              <div class="d-flex align-items-center gap-2 mb-1 flex-wrap">
                <span class="notif-title text-truncate">{{n.title}}</span>
                <span class="target-badge flex-shrink-0" [class.badge-admin]="n.target==='admin'" [class.badge-user]="n.target==='user'" [class.badge-both]="n.target==='both'">
                  <i class="fa-solid me-1" [class.fa-user-tie]="n.target==='admin'" [class.fa-users]="n.target==='user'" [class.fa-globe]="n.target==='both'"></i>
                  {{n.target === 'both' ? 'All' : n.target}}
                </span>
              </div>
              <p class="notif-msg mb-1">{{n.message}}</p>
              <small class="text-muted">{{n.createdAt | date:'dd MMM yyyy, hh:mm a'}}</small>
            </div>
            <button class="btn-del-notif flex-shrink-0" (click)="deleteNotif(n._id)" title="Delete">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
  `,
  styles: [`
    .notif-form-card { background: white; border-radius: 16px; padding: 28px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    .notif-history-card { background: white; border-radius: 16px; padding: 28px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); max-height: 600px; overflow-y: auto; }
    @media (max-width: 576px) { .notif-history-card { max-height: none; padding: 20px 16px; } .notif-form-card { padding: 20px 16px; } }
    .field-label { font-size: 0.78rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px; }
    .field-input { width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 0.9rem; color: #1e293b; outline: none; transition: border-color 0.2s; resize: none; }
    .field-input:focus { border-color: #556ee6; }
    .target-btn { flex: 1; padding: 10px 8px; border: 1.5px solid #e2e8f0; border-radius: 10px; text-align: center; cursor: pointer; font-size: 0.82rem; font-weight: 600; color: #64748b; transition: all 0.2s; }
    .target-btn:hover { border-color: #556ee6; color: #556ee6; }
    .target-btn.active { background: #556ee6; border-color: #556ee6; color: white; }
    .notif-item { padding: 16px; border-radius: 12px; border: 1px solid #f1f5f9; margin-bottom: 12px; transition: all 0.2s; }
    .notif-item:hover { background: #f8faff; border-color: #e2e8f0; }
    .notif-title { font-weight: 700; color: #1e293b; font-size: 0.95rem; }
    .notif-msg { color: #64748b; font-size: 0.88rem; line-height: 1.5; }
    .target-badge { font-size: 0.7rem; font-weight: 700; padding: 3px 10px; border-radius: 50px; text-transform: uppercase; }
    .badge-admin { background: #fef3c7; color: #92400e; }
    .badge-user { background: #eff6ff; color: #1d4ed8; }
    .badge-both { background: #f0fdf4; color: #166534; }
    .btn-del-notif { width: 32px; height: 32px; border: none; background: #fff1f2; color: #e11d48; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.8rem; flex-shrink: 0; }
    .btn-del-notif:hover { background: #ffe4e6; }
  `]
})
export class NotificationsComponent implements OnInit {
  notifications = signal<any[]>([]);
  loading = signal(true);
  sending = signal(false);
  form = { title: '', message: '', target: 'both' };

  constructor(private api: AdminApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.api.getAllNotifications().subscribe({
      next: (res) => { this.notifications.set(res.data || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  send() {
    if (!this.form.title || !this.form.message) {
      (window as any).Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: 'Title and message are required', showConfirmButton: false, timer: 2500 });
      return;
    }
    this.sending.set(true);
    this.api.sendNotification(this.form).subscribe({
      next: (res) => {
        this.notifications.update(n => [res.data, ...n]);
        this.form = { title: '', message: '', target: 'both' };
        this.sending.set(false);
        (window as any).Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Notification sent!', showConfirmButton: false, timer: 2500 });
      },
      error: (err) => {
        this.sending.set(false);
        (window as any).Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: err.error?.message || 'Failed to send', showConfirmButton: false, timer: 3000 });
      }
    });
  }

  deleteNotif(id: string) {
    (window as any).Swal.fire({ title: 'Delete Notification?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#e11d48', confirmButtonText: 'Delete' }).then((r: any) => {
      if (!r.isConfirmed) return;
      this.api.deleteNotification(id).subscribe({
        next: () => {
          this.notifications.update(n => n.filter(x => x._id !== id));
          (window as any).Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Deleted', showConfirmButton: false, timer: 2000 });
        }
      });
    });
  }
}
