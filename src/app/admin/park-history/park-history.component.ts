import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-park-history',
  imports: [CommonModule],
  template: `
<div class="container-fluid py-4">
  <div class="row">
    <div class="col-12">
      <div class="history-card p-0 overflow-hidden">
        <div class="d-flex justify-content-between align-items-center p-4">
          <div>
            <h4 class="fw-bold mb-1">Parking History</h4>
            <p class="text-muted small mb-0">Total of <strong>{{records().length}}</strong> records</p>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-secondary btn-sm"><i class="bi bi-filter"></i> Filter</button>
            <button class="btn btn-primary btn-sm"><i class="bi bi-download"></i> Export</button>
          </div>
        </div>

        <div *ngIf="loading()" class="text-center py-5"><div class="spinner-border text-primary"></div></div>

        <div class="table-responsive px-2" *ngIf="!loading()">
          <table class="table table-custom mb-0">
            <thead>
              <tr>
                <th class="text-center" style="width:50px">#</th>
                <th>Owner & Vehicle</th>
                <th>Type</th>
                <th>Stay Info</th>
                <th>Status</th>
                <th>Amount</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of records(); let i = index">
                <td class="text-center text-muted small">{{i+1}}</td>
                <td>
                  <div class="d-flex flex-column">
                    <span class="vehicle-no">{{row.vehiclenumber}}</span>
                    <span class="text-muted small">{{row.ownername}}</span>
                  </div>
                </td>
                <td>
                  <span *ngIf="row.type === '2W'" class="text-primary small fw-bold"><i class="fa-solid fa-motorcycle me-1"></i> 2W</span>
                  <span *ngIf="row.type === '4W'" class="text-success small fw-bold"><i class="fa-solid fa-car me-1"></i> 4W</span>
                </td>
                <td>
                  <div class="small">
                    <div class="text-dark fw-semibold">{{row.date}}</div>
                    <div class="text-muted">{{row.intime}} — {{row.outtime === '-' ? 'Active' : row.outtime}}</div>
                  </div>
                </td>
                <td>
                  <span *ngIf="row.outtime === '-'" class="status-badge status-parked"><i class="bi bi-record-fill animate-pulse"></i> Parked</span>
                  <span *ngIf="row.outtime !== '-'" class="status-badge status-completed"><i class="bi bi-check-circle-fill"></i> Completed</span>
                </td>
                <td><span class="amount-text">₹{{row.amount ?? '0'}}</span></td>
                <td class="text-end">
                  <div class="d-flex justify-content-end gap-1">
                    <button *ngIf="row.outtime !== '-'" class="btn btn-sm btn-outline-success" title="Bill" (click)="getReceipt(row._id)"><i class="fa-solid fa-money-bill"></i></button>
                    <button *ngIf="row.outtime === '-'" class="btn btn-sm btn-danger" title="Exit" (click)="exitVehicle(row._id)"><i class="fa-solid fa-arrow-right-from-bracket"></i></button>
                    <button class="btn btn-sm btn-outline-danger" title="Delete" (click)="deleteRecord(row._id)"><i class="fa-solid fa-trash"></i></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>
  `,
  styles: [`
    .history-card { background:#fff; border-radius:16px; box-shadow:0 4px 24px rgba(0,0,0,0.04); border:1px solid #f1f5f9; }
    .table-custom thead th { background:#f8fafc; color:#64748b; font-size:0.8rem; text-transform:uppercase; letter-spacing:0.5px; font-weight:700; padding:16px; border-top:none; }
    .table-custom tbody td { padding:16px; vertical-align:middle; color:#334155; border-bottom:1px solid #f1f5f9; }
    .table-custom tbody tr:hover { background-color:#f8fbff; }
    .status-badge { padding:6px 12px; border-radius:8px; font-size:0.75rem; font-weight:600; display:inline-flex; align-items:center; gap:4px; }
    .status-completed { background:#dcfce7; color:#166534; }
    .status-parked { background:#fef9c3; color:#854d0e; }
    .vehicle-no { font-family:'Monaco',monospace; font-weight:700; color:#0f172a; letter-spacing:0.5px; }
    .amount-text { font-weight:700; color:#059669; }
    @keyframes pulse-red { 0%,100%{opacity:1} 50%{opacity:0.3} }
    .animate-pulse { animation:pulse-red 2s infinite; color:#ef4444; }
  `]
})
export class ParkHistoryComponent implements OnInit {
  records = signal<any[]>([]);
  loading = signal(true);

  constructor(private api: AdminApiService) {}

  ngOnInit() {
    this.api.getParkingHistory().subscribe({
      next: (res) => { this.records.set(res.data || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  exitVehicle(id: string) {
    this.api.exitVehicle(id).subscribe({
      next: (res) => this.records.update(r => r.map(x => x._id === id ? res.data : x))
    });
  }

  deleteRecord(id: string) {
    if (!confirm('Delete this record?')) return;
    this.api.deleteRecord(id).subscribe({
      next: () => this.records.update(r => r.filter(x => x._id !== id))
    });
  }

  getReceipt(id: string) {
    this.api.getReceipt(id).subscribe({
      next: (res) => alert(`Receipt\nVehicle: ${res.data.vehiclenumber}\nOwner: ${res.data.ownername}\nIn: ${res.data.intime} | Out: ${res.data.outtime}\nAmount: ₹${res.data.amount}`)
    });
  }
}
