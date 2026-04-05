import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-faqs',
  imports: [CommonModule, FormsModule],
  template: `
<div class="container-fluid py-4">
  <div class="row g-4">

    <!-- Add / Edit Form -->
    <div class="col-lg-4">
      <div class="faq-form-card">
        <h5 class="fw-bold mb-4">{{editId() ? 'Edit FAQ' : 'Add New FAQ'}}</h5>

        <div class="mb-3">
          <label class="form-label small fw-semibold">Question</label>
          <textarea class="form-control" rows="3" [(ngModel)]="form.question" placeholder="Enter question..."></textarea>
        </div>
        <div class="mb-3">
          <label class="form-label small fw-semibold">Answer</label>
          <textarea class="form-control" rows="4" [(ngModel)]="form.answer" placeholder="Enter answer..."></textarea>
        </div>
        <div class="mb-4">
          <label class="form-label small fw-semibold">Display Order</label>
          <input type="number" class="form-control" [(ngModel)]="form.order" placeholder="0">
        </div>

        <div *ngIf="msg()" class="alert alert-success border-0 rounded-3 small py-2 mb-3">
          <i class="fa-solid fa-circle-check me-1"></i>{{msg()}}
        </div>

        <div class="d-flex gap-2">
          <button class="btn btn-primary flex-grow-1" (click)="save()" [disabled]="saving()">
            <span *ngIf="!saving()"><i class="fa-solid fa-{{editId() ? 'floppy-disk' : 'plus'}} me-2"></i>{{editId() ? 'Update' : 'Add FAQ'}}</span>
            <span *ngIf="saving()"><i class="fa-solid fa-spinner fa-spin me-2"></i>Saving...</span>
          </button>
          <button *ngIf="editId()" class="btn btn-outline-secondary" (click)="cancelEdit()">Cancel</button>
        </div>
      </div>
    </div>

    <!-- FAQ List -->
    <div class="col-lg-8">
      <div class="faq-list-card">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 class="fw-bold mb-0">All FAQs</h5>
            <small class="text-muted">{{faqs().length}} total</small>
          </div>
        </div>

        <div *ngIf="loading()" class="text-center py-5"><div class="spinner-border" style="color:#556ee6"></div></div>

        <div *ngIf="!loading() && faqs().length === 0" class="text-center py-5 text-muted">
          <i class="fa-solid fa-circle-question fs-1 d-block mb-3"></i>
          No FAQs yet. Add your first one!
        </div>

        <div *ngFor="let faq of faqs(); let i = index" class="faq-item">
          <div class="d-flex justify-content-between align-items-start gap-3">
            <div class="flex-grow-1">
              <div class="d-flex align-items-center gap-2 mb-1">
                <span class="order-badge">{{faq.order || i+1}}</span>
                <span class="faq-status" [class.active]="faq.active" [class.inactive]="!faq.active">
                  {{faq.active ? 'Active' : 'Hidden'}}
                </span>
              </div>
              <div class="faq-q">{{faq.question}}</div>
              <div class="faq-a">{{faq.answer}}</div>
            </div>
            <div class="d-flex gap-1 flex-shrink-0">
              <button class="btn btn-sm btn-outline-warning" (click)="toggleActive(faq)" title="Toggle visibility">
                <i class="fa-solid fa-{{faq.active ? 'eye-slash' : 'eye'}}"></i>
              </button>
              <button class="btn btn-sm btn-outline-primary" (click)="startEdit(faq)">
                <i class="fa-solid fa-pen"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger" (click)="deleteFaq(faq._id)">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
  `,
  styles: [`
    .faq-form-card { background:white; border-radius:16px; padding:24px; box-shadow:0 2px 12px rgba(0,0,0,0.06); }
    .faq-list-card { background:white; border-radius:16px; padding:24px; box-shadow:0 2px 12px rgba(0,0,0,0.06); }
    .faq-item { padding:16px; border-radius:12px; border:1px solid #f1f5f9; margin-bottom:12px; transition:box-shadow 0.2s; }
    .faq-item:hover { box-shadow:0 4px 12px rgba(0,0,0,0.06); }
    .order-badge { background:#eff6ff; color:#1d4ed8; font-size:0.7rem; font-weight:700; padding:2px 8px; border-radius:20px; }
    .faq-status { font-size:0.7rem; font-weight:700; padding:2px 8px; border-radius:20px; }
    .faq-status.active { background:#dcfce7; color:#166534; }
    .faq-status.inactive { background:#f1f5f9; color:#94a3b8; }
    .faq-q { font-weight:700; color:#1e293b; font-size:0.92rem; margin-bottom:6px; }
    .faq-a { font-size:0.82rem; color:#64748b; line-height:1.6; }
  `]
})
export class FaqsComponent implements OnInit {
  faqs = signal<any[]>([]);
  loading = signal(true);
  saving = signal(false);
  msg = signal('');
  editId = signal('');
  form: any = { question: '', answer: '', order: 0 };

  constructor(private api: AdminApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.api.getFaqs().subscribe({
      next: (res) => { this.faqs.set(res.data || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  save() {
    if (!this.form.question?.trim() || !this.form.answer?.trim()) return;
    this.saving.set(true);
    const call = this.editId()
      ? this.api.updateFaq(this.editId(), this.form)
      : this.api.createFaq(this.form);
    call.subscribe({
      next: (res) => {
        if (this.editId()) {
          this.faqs.update(f => f.map(x => x._id === this.editId() ? res.data : x));
        } else {
          this.faqs.update(f => [...f, res.data]);
        }
        this.saving.set(false);
        this.msg.set(this.editId() ? 'FAQ updated!' : 'FAQ added!');
        setTimeout(() => this.msg.set(''), 2500);
        this.cancelEdit();
      },
      error: () => this.saving.set(false)
    });
  }

  startEdit(faq: any) {
    this.editId.set(faq._id);
    this.form = { question: faq.question, answer: faq.answer, order: faq.order, active: faq.active };
  }

  cancelEdit() {
    this.editId.set('');
    this.form = { question: '', answer: '', order: 0 };
  }

  toggleActive(faq: any) {
    this.api.updateFaq(faq._id, { active: !faq.active }).subscribe({
      next: (res) => this.faqs.update(f => f.map(x => x._id === faq._id ? res.data : x))
    });
  }

  deleteFaq(id: string) {
    if (!confirm('Delete this FAQ?')) return;
    this.api.deleteFaq(id).subscribe({
      next: () => this.faqs.update(f => f.filter(x => x._id !== id))
    });
  }
}
