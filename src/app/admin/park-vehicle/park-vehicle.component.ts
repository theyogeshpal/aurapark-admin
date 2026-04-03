import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-park-vehicle',
  imports: [CommonModule, FormsModule],
  template: `
<div class="row g-4">
  <div class="col-lg-4">
    <div class="entry-card p-4">
      <div class="d-flex align-items-center mb-4">
        <div class="bg-primary bg-opacity-10 p-2 rounded-3 me-3"><i class="bi bi-plus-circle-fill text-primary fs-4"></i></div>
        <h4 class="mb-0 fw-bold">Walk-in Entry</h4>
      </div>

      <div *ngIf="successMsg()" class="alert alert-success border-0 shadow-sm d-flex align-items-center">
        <i class="bi bi-check-circle-fill me-2"></i><div>Vehicle <strong>{{successMsg()}}</strong> Logged!</div>
      </div>
      <div *ngIf="errorMsg()" class="alert alert-danger border-0 shadow-sm small">
        <i class="bi bi-x-circle-fill me-2"></i>{{errorMsg()}}
      </div>

      <form (ngSubmit)="saveParking()">
        <div class="mb-3">
          <label class="form-label">Owner Name</label>
          <div class="input-group">
            <span class="input-group-text bg-light border-0"><i class="fa-solid fa-user"></i></span>
            <input type="text" class="form-control bg-light border-0" [(ngModel)]="form.ownername" name="ownername" placeholder="Vehicle Owner Name" required>
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label">Vehicle Number</label>
          <div class="input-group">
            <span class="input-group-text bg-light border-0"><i class="fa-solid fa-hashtag"></i></span>
            <input type="text" class="form-control bg-light border-0 text-uppercase" [(ngModel)]="form.vehiclenumber" name="vehiclenumber" placeholder="UP 32 AB 1234" required>
          </div>
        </div>
        <div class="mb-4">
          <label class="form-label">Category</label>
          <div class="d-flex gap-2">
            <input type="radio" class="btn-check" name="type" id="type2w" value="2W" [(ngModel)]="form.type">
            <label class="btn btn-outline-primary w-50 py-2" for="type2w"><i class="bi bi-bicycle me-1"></i> 2W</label>
            <input type="radio" class="btn-check" name="type" id="type4w" value="4W" [(ngModel)]="form.type">
            <label class="btn btn-outline-success w-50 py-2" for="type4w"><i class="bi bi-car-front me-1"></i> 4W</label>
          </div>
        </div>
        <button type="submit" class="btn btn-primary w-100 py-3 fw-bold shadow-sm" [disabled]="saving()">
          <span *ngIf="!saving()">Generate Entry Ticket <i class="bi bi-arrow-right-short ms-1"></i></span>
          <span *ngIf="saving()"><i class="fa-solid fa-spinner fa-spin me-2"></i>Saving...</span>
        </button>
      </form>
    </div>
  </div>

  <div class="col-lg-8">
    <div class="custom-table-card">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 class="mb-0 fw-bold">Slot Status</h4>
          <small class="text-muted">Walk-in + Online bookings</small>
        </div>
        <div class="d-flex gap-2 align-items-center">
          <span class="badge bg-warning text-dark px-2 py-1"><i class="bi bi-record-fill me-1"></i>{{activeVehicles().length}} Active</span>
          <button class="btn btn-sm btn-outline-secondary" (click)="loadActive()"><i class="bi bi-arrow-clockwise"></i></button>
        </div>
      </div>

      <div *ngIf="loading()" class="text-center py-4"><div class="spinner-border text-primary"></div></div>

      <div class="table-responsive" *ngIf="!loading()">
        <table class="table">
          <thead>
            <tr>
              <th>Vehicle Details</th>
              <th>Source</th>
              <th>In Time</th>
              <th>Out Time</th>
              <th>Amount</th>
              <th class="text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of activeVehicles()">
              <td>
                <div class="d-flex align-items-center">
                  <span [class]="row.type === '2W' ? 'badge-2w me-3' : 'badge-4w me-3'">
                    <i [class]="row.type === '2W' ? 'fa-solid fa-motorcycle' : 'fa-solid fa-car'"></i>
                  </span>
                  <div>
                    <div class="fw-bold text-dark">{{row.vehiclenumber}}</div>
                    <div class="small text-muted">{{row.ownername}}</div>
                  </div>
                </div>
              </td>
              <td>
                <span *ngIf="row.source === 'online'" class="source-badge online">
                  <i class="fa-solid fa-globe me-1"></i>Online
                </span>
                <span *ngIf="row.source !== 'online'" class="source-badge walkin">
                  <i class="fa-solid fa-person-walking me-1"></i>Walk-in
                </span>
              </td>
              <td><small class="fw-semibold text-secondary">{{row.intime}}</small></td>
              <td>
                <small *ngIf="row.outtime === '-'" class="text-warning fw-semibold">Active</small>
                <small *ngIf="row.outtime !== '-'" class="text-muted">{{row.outtime}}</small>
              </td>
              <td><small class="fw-semibold text-success">{{row.amount ? '₹' + row.amount : '—'}}</small></td>
              <td class="text-end">
                <button *ngIf="row.outtime === '-'" class="btn btn-outline-danger btn-sm px-3 rounded-pill" (click)="exitVehicle(row._id)" [disabled]="exiting() === row._id">
                  <span *ngIf="exiting() !== row._id">Checkout</span>
                  <span *ngIf="exiting() === row._id"><i class="fa-solid fa-spinner fa-spin"></i></span>
                </button>
                <span *ngIf="row.outtime !== '-'" class="badge bg-success">Done</span>
              </td>
            </tr>
            <tr *ngIf="activeVehicles().length === 0">
              <td colspan="6" class="text-center py-5 text-muted">
                <i class="bi bi-info-circle d-block fs-2 mb-2"></i>No vehicles currently in the lot.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
  `,
  styles: [`
    .entry-card { background:#fff; border:none; border-radius:20px; box-shadow:0 10px 30px rgba(0,0,0,0.05); border-top:5px solid #0d6efd; }
    .custom-table-card { background:#fff; border-radius:20px; box-shadow:0 10px 30px rgba(0,0,0,0.05); padding:25px; }
    .table thead th { background-color:#fcfcfc; text-transform:uppercase; font-size:0.72rem; letter-spacing:1px; font-weight:700; color:#6c757d; border:none; padding:12px 15px; }
    .table tbody tr { vertical-align:middle; }
    .table tbody tr:hover { background-color:#f8faff; }
    .badge-2w { background-color:#e7f3ff; color:#007bff; border-radius:8px; padding:6px 10px; }
    .badge-4w { background-color:#f0fdf4; color:#198754; border-radius:8px; padding:6px 10px; }
    .source-badge { padding:4px 10px; border-radius:50px; font-size:0.72rem; font-weight:700; }
    .source-badge.online { background:#eff6ff; color:#1d4ed8; }
    .source-badge.walkin { background:#f0fdf4; color:#15803d; }
    .form-label { font-weight:600; color:#495057; font-size:0.9rem; }
  `]
})
export class ParkVehicleComponent implements OnInit {
  form = { ownername: '', vehiclenumber: '', type: '2W' };
  activeVehicles = signal<any[]>([]);
  loading = signal(true);
  saving = signal(false);
  exiting = signal<string | null>(null);
  successMsg = signal('');
  errorMsg = signal('');

  constructor(private api: AdminApiService) {}

  ngOnInit() { this.loadActive(); }

  loadActive() {
    this.loading.set(true);
    this.api.getActiveVehicles().subscribe({
      next: (res) => { this.activeVehicles.set(res.data || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  saveParking() {
    this.errorMsg.set(''); this.saving.set(true);
    this.api.parkVehicle({ vehiclenumber: this.form.vehiclenumber.toUpperCase(), ownername: this.form.ownername, type: this.form.type }).subscribe({
      next: (res) => {
        this.successMsg.set(res.data.vehiclenumber);
        this.activeVehicles.update(v => [res.data, ...v]);
        this.form = { ownername: '', vehiclenumber: '', type: '2W' };
        this.saving.set(false);
        setTimeout(() => this.successMsg.set(''), 3000);
      },
      error: (err) => { this.errorMsg.set(err.error?.message || 'Failed to park vehicle'); this.saving.set(false); }
    });
  }

  exitVehicle(id: string) {
    this.exiting.set(id);
    this.api.exitVehicle(id).subscribe({
      next: (res) => {
        this.activeVehicles.update(v => v.map(x => x._id === id ? res.data : x));
        this.exiting.set(null);
      },
      error: () => this.exiting.set(null)
    });
  }
}
