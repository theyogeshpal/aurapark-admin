import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-prebookings',
  imports: [CommonModule],
  template: `
<div class="container-fluid py-4">
  <div class="row">
    <div class="col-12">
      <div class="prebook-card p-0 overflow-hidden">
        <div class="d-flex justify-content-between align-items-center p-4">
          <div>
            <h4 class="fw-bold mb-1">Pre-Bookings</h4>
            <p class="text-muted small mb-0">Online bookings awaiting vehicle check-in — <strong>{{bookings().length}}</strong> pending</p>
          </div>
          <button class="btn btn-outline-primary btn-sm" (click)="load()">
            <i class="fa-solid fa-rotate-right me-1"></i> Refresh
          </button>
        </div>

        <div *ngIf="loading()" class="text-center py-5"><div class="spinner-border text-primary"></div></div>

        <div *ngIf="!loading() && bookings().length === 0" class="text-center py-5">
          <i class="fa-solid fa-calendar-check text-muted" style="font-size:3rem"></i>
          <p class="text-muted mt-3 mb-0">No pending pre-bookings</p>
        </div>

        <div class="table-responsive px-2 d-none d-md-block" *ngIf="!loading() && bookings().length > 0">
          <table class="table table-custom mb-0">
            <thead>
              <tr>
                <th class="text-center" style="width:50px">#</th>
                <th>Customer & Vehicle</th>
                <th>Type</th>
                <th>Booking Slot</th>
                <th>Duration</th>
                <th>Amount Payable</th>
                <th class="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let b of bookings(); let i = index">
                <td class="text-center text-muted small">{{i+1}}</td>
                <td>
                  <div class="d-flex flex-column">
                    <span class="vehicle-no">{{b.vehicleNumber || '—'}}</span>
                    <span class="text-muted small">{{b.parkingName}}</span>
                    <span class="ref-badge mt-1">{{b.bookingRef}}</span>
                  </div>
                </td>
                <td>
                  <span *ngIf="b.vehicleType === '2W'" class="text-primary small fw-bold"><i class="fa-solid fa-motorcycle me-1"></i>2W</span>
                  <span *ngIf="b.vehicleType === '4W'" class="text-success small fw-bold"><i class="fa-solid fa-car me-1"></i>4W</span>
                </td>
                <td>
                  <div class="small">
                    <div class="fw-semibold text-dark">{{b.date}}</div>
                    <div class="text-success fw-bold">{{formatTime(b.time)}} <span class="text-muted fw-normal">→</span> <span class="text-danger">{{formatTime(b.endTime)}}</span></div>
                  </div>
                </td>
                <td><span class="dur-badge">{{b.duration}} hr</span></td>
                <td>
                  <div class="d-flex flex-column">
                    <span class="amount-text">₹{{b.totalPrice}}</span>
                    <span class="text-muted" style="font-size:0.72rem">Pay at exit</span>
                  </div>
                </td>
                <td class="text-center">
                  <button class="btn-checkin" (click)="checkIn(b._id)" [disabled]="checkingIn() === b._id">
                    <span *ngIf="checkingIn() !== b._id"><i class="fa-solid fa-right-to-bracket me-1"></i>Check In</span>
                    <span *ngIf="checkingIn() === b._id"><i class="fa-solid fa-spinner fa-spin me-1"></i>...</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Cards -->
        <div class="d-md-none px-3 pb-3" *ngIf="!loading() && bookings().length > 0">
          <div class="mobile-card" *ngFor="let b of bookings()">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <span class="vehicle-no">{{b.vehicleNumber || '—'}}</span>
                <div class="ref-badge mt-1">{{b.bookingRef}}</div>
              </div>
              <span class="dur-badge">{{b.duration}} hr</span>
            </div>
            <div class="mobile-card-row"><span class="mc-label">Date</span><span>{{b.date}}</span></div>
            <div class="mobile-card-row">
              <span class="mc-label">Slot</span>
              <span class="text-success fw-bold small">{{formatTime(b.time)}} → <span class="text-danger">{{formatTime(b.endTime)}}</span></span>
            </div>
            <div class="mobile-card-row"><span class="mc-label">Amount</span><span class="amount-text">₹{{b.totalPrice}}</span></div>
            <button class="btn-checkin w-100 mt-3" (click)="checkIn(b._id)" [disabled]="checkingIn() === b._id">
              <span *ngIf="checkingIn() !== b._id"><i class="fa-solid fa-right-to-bracket me-1"></i>Check In</span>
              <span *ngIf="checkingIn() === b._id"><i class="fa-solid fa-spinner fa-spin me-1"></i>Processing...</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
  `,
  styles: [`
    .prebook-card { background:#fff; border-radius:16px; box-shadow:0 4px 24px rgba(0,0,0,0.04); border:1px solid #f1f5f9; }
    .table-custom thead th { background:#f8fafc; color:#64748b; font-size:0.8rem; text-transform:uppercase; letter-spacing:0.5px; font-weight:700; padding:16px; border-top:none; }
    .table-custom tbody td { padding:16px; vertical-align:middle; color:#334155; border-bottom:1px solid #f1f5f9; }
    .table-custom tbody tr:hover { background-color:#f8fbff; }
    .vehicle-no { font-family:'Monaco',monospace; font-weight:700; color:#0f172a; letter-spacing:0.5px; }
    .ref-badge { font-size:0.68rem; background:#f1f5f9; color:#64748b; padding:2px 8px; border-radius:6px; font-family:monospace; width:fit-content; }
    .dur-badge { background:#eff6ff; color:#1d4ed8; padding:4px 10px; border-radius:8px; font-size:0.78rem; font-weight:700; }
    .amount-text { font-weight:800; color:#059669; font-size:1rem; }
    .btn-checkin { background:linear-gradient(135deg,#f59e0b,#d97706); color:white; border:none; border-radius:10px; padding:8px 16px; font-size:0.82rem; font-weight:700; cursor:pointer; transition:all 0.2s; white-space:nowrap; }
    .btn-checkin:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 4px 12px rgba(245,158,11,0.35); }
    .btn-checkin:disabled { opacity:0.6; cursor:not-allowed; }
    .mobile-card { background:white; border:1px solid #f1f5f9; border-radius:14px; padding:16px; margin-bottom:12px; box-shadow:0 2px 8px rgba(0,0,0,0.04); }
    .mobile-card-row { display:flex; justify-content:space-between; align-items:center; padding:5px 0; border-bottom:1px solid #f8fafc; font-size:0.85rem; }
    .mobile-card-row:last-of-type { border-bottom:none; }
    .mc-label { color:#94a3b8; font-weight:600; font-size:0.78rem; text-transform:uppercase; }
  `]
})
export class PrebookingsComponent implements OnInit {
  bookings = signal<any[]>([]);
  loading = signal(true);
  checkingIn = signal('');

  constructor(private api: AdminApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.api.getPreBookings().subscribe({
      next: (res) => { this.bookings.set(res.data || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  checkIn(id: string) {
    this.checkingIn.set(id);
    this.api.checkInVehicle(id).subscribe({
      next: () => {
        this.bookings.update(b => b.filter(x => x._id !== id));
        this.checkingIn.set('');
      },
      error: () => this.checkingIn.set('')
    });
  }

  formatTime(time: string): string {
    if (!time) return '—';
    const [h, m] = time.split(':').map(Number);
    const ap = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ap}`;
  }
}
