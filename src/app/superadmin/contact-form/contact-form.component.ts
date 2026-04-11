import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-contact-form',
  imports: [CommonModule],
  template: `
<div class="container py-4">
  <div class="text-center mb-5">
    <h2 class="fw-bold text-dark">User Feedback <span class="text-primary">&</span> Suggestions</h2>
    <p class="text-muted">Review what people are saying about the parking services.</p>
  </div>

  <div *ngIf="loading()" class="text-center py-5"><div class="spinner-border text-primary"></div></div>

  <div class="feedback-card" *ngIf="!loading()">
    <div class="table-responsive d-none d-md-block">
      <table class="table table-hover align-middle">
        <thead class="text-center">
          <tr>
            <th style="width:5%">#</th>
            <th style="width:20%">User</th>
            <th style="width:20%">Contact Info</th>
            <th style="width:45%">Message Content</th>
            <th style="width:10%">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of feedbacks(); let i = index">
            <td class="text-center sr-num">{{(i+1).toString().padStart(2,'0')}}</td>
            <td class="text-center">
              <div class="user-avatar shadow-sm mx-auto">{{row.name.charAt(0).toUpperCase()}}</div>
              <div class="fw-bold text-dark mt-1">{{row.name}}</div>
            </td>
            <td>
              <div class="d-flex flex-column small">
                <span><i class="fa-solid fa-envelope text-muted me-2"></i>{{row.email}}</span>
                <span><i class="fa-solid fa-phone text-muted me-2"></i>{{row.mobile}}</span>
              </div>
            </td>
            <td class="text-center">
              <div class="message-text shadow-sm border">
                <i class="fa-solid fa-quote-left text-primary opacity-25 me-2"></i>{{row.message}}
              </div>
            </td>
            <td class="text-center">
              <button class="btn btn-sm btn-outline-danger border-0 p-2" (click)="deleteFeedback(row.id)" title="Delete">
                <i class="fa-solid fa-trash-can fs-5"></i>
              </button>
            </td>
          </tr>
          <tr *ngIf="feedbacks().length === 0">
            <td colspan="5" class="text-center py-5 text-muted">No feedback records found.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile Cards -->
    <div class="d-md-none">
      <div *ngFor="let row of feedbacks()" class="cf-card">
        <div class="d-flex align-items-center gap-3 mb-2">
          <div class="user-avatar">{{row.name.charAt(0).toUpperCase()}}</div>
          <div>
            <div class="fw-bold text-dark">{{row.name}}</div>
            <div class="text-muted small">{{row.email}}</div>
          </div>
        </div>
        <div class="cf-row"><span class="cf-label">Mobile</span><span class="small">{{row.mobile || '—'}}</span></div>
        <div class="cf-msg">
          <i class="fa-solid fa-quote-left text-primary opacity-25 me-1"></i>{{row.message}}
        </div>
        <div class="text-end mt-2">
          <button class="btn btn-sm btn-outline-danger" (click)="deleteFeedback(row.id)">
            <i class="fa-solid fa-trash me-1"></i>Delete
          </button>
        </div>
      </div>
      <div *ngIf="feedbacks().length === 0" class="text-center py-5 text-muted">No feedback records found.</div>
    </div>
  </div>
</div>
  `,
  styles: [`
    .feedback-card { background:white; border-radius:12px; border:1px solid #eef0f2; box-shadow:0 2px 10px rgba(0,0,0,0.02); padding:20px; }
    .message-text { background-color:#f8f9fa; padding:10px 15px; border-radius:8px; color:#495057; font-style:italic; font-size:0.95rem; max-width:400px; display:inline-block; text-align:left; }
    .user-avatar { width:40px; height:40px; background:#6610f2; color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; }
    .table thead th { border-bottom:2px solid #f1f1f1; color:#6c757d; font-size:0.85rem; text-transform:uppercase; letter-spacing:1px; }
    .sr-num { color:#dee2e6; font-weight:800; font-size:1.2rem; }
    .cf-card { background:white; border:1px solid #f1f5f9; border-radius:14px; padding:16px; margin-bottom:12px; box-shadow:0 2px 8px rgba(0,0,0,0.04); }
    .cf-row { display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px solid #f8fafc; font-size:0.85rem; }
    .cf-label { color:#94a3b8; font-weight:600; font-size:0.75rem; text-transform:uppercase; }
    .cf-msg { background:#f8fafc; border-radius:10px; padding:10px 12px; font-size:0.85rem; color:#475569; font-style:italic; margin-top:10px; line-height:1.5; }
  `]
})
export class ContactFormComponent implements OnInit {
  feedbacks = signal<any[]>([]);
  loading = signal(true);

  constructor(private api: AdminApiService) {}

  ngOnInit() {
    this.api.getAllContacts().subscribe({
      next: (res) => { this.feedbacks.set(res.data || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  deleteFeedback(id: number) {
    if (!confirm('Delete this feedback?')) return;
    this.api.deleteContact(id).subscribe({
      next: () => this.feedbacks.update(f => f.filter(x => x.id !== id))
    });
  }
}
