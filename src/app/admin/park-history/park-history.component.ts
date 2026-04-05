import { Component, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
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
                    <span *ngIf="row.source === 'online'" class="source-badge source-online mt-1"><i class="fa-solid fa-globe me-1"></i>Online</span>
                    <span *ngIf="row.source !== 'online'" class="source-badge source-walkin mt-1"><i class="fa-solid fa-person-walking me-1"></i>Walk-in</span>
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
                  <span *ngIf="row.outtime !== '-' && row.paymentStatus !== 'completed'" class="status-badge status-pending"><i class="bi bi-hourglass-split"></i> Pending</span>
                  <span *ngIf="row.paymentStatus === 'completed'" class="status-badge status-completed"><i class="bi bi-check-circle-fill"></i> Paid</span>
                </td>
                <td><span class="amount-text">₹{{row.amount ?? '0'}}</span></td>
                <td class="text-end">
                  <div class="d-flex justify-content-end gap-1">
                    <button *ngIf="row.outtime !== '-'" class="btn btn-sm btn-outline-success" title="Download Bill" (click)="downloadBill(row)">
                      <i class="fa-solid fa-download"></i>
                    </button>
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

<!-- Hidden Bill Template for Download -->
<div #billTpl style="position:fixed;left:-9999px;top:0;width:420px;background:white;font-family:sans-serif;" *ngIf="billData()">
  <div style="background:linear-gradient(135deg,#0f172a,#1e293b);color:white;padding:20px 24px;display:flex;justify-content:space-between;align-items:center">
    <div style="display:flex;align-items:center;gap:10px">
      <span style="font-size:1.8rem">🅿</span>
      <div><div style="font-size:1.1rem;font-weight:800">AuraPark</div><div style="font-size:0.7rem;opacity:0.5">Parking Bill</div></div>
    </div>
    <div style="text-align:right"><div style="font-size:0.65rem;opacity:0.5;text-transform:uppercase">Date</div><div style="font-size:0.85rem;font-weight:700;color:#10b981">{{billData()!.date}}</div></div>
  </div>
  <div style="padding:16px 24px">
    <div *ngFor="let r of billRows()" style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #f8fafc;font-size:0.88rem">
      <span style="color:#94a3b8">{{r.key}}</span><span style="color:#1e293b;font-weight:600">{{r.val}}</span>
    </div>
  </div>
  <div style="border-top:2px dashed #e2e8f0;margin:0 24px"></div>
  <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 24px">
    <span style="font-size:1rem;font-weight:700;color:#1e293b">Total Amount</span>
    <span style="font-size:1.8rem;font-weight:800;color:#10b981">₹{{billData()!.amount}}</span>
  </div>
  <div style="margin:0 24px 16px;padding:10px 16px;border-radius:10px;background:#dcfce7;color:#166534;font-size:0.85rem;font-weight:700;display:flex;align-items:center;gap:8px">
    ✅ Payment Completed
  </div>
  <div style="padding:12px 24px 20px;text-align:center;border-top:1px solid #f1f5f9;font-size:0.72rem;color:#94a3b8">
    Thank you for parking with AuraPark
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
    .status-pending { background:#fef9c3; color:#854d0e; }
    .status-parked { background:#fef9c3; color:#854d0e; }
    .vehicle-no { font-family:'Monaco',monospace; font-weight:700; color:#0f172a; letter-spacing:0.5px; }
    .amount-text { font-weight:700; color:#059669; }
    .source-badge { font-size:0.68rem; font-weight:600; padding:2px 8px; border-radius:6px; display:inline-flex; align-items:center; width:fit-content; }
    .source-online { background:#eff6ff; color:#1d4ed8; }
    .source-walkin { background:#f5f3ff; color:#7c3aed; }
    @keyframes pulse-red { 0%,100%{opacity:1} 50%{opacity:0.3} }
    .animate-pulse { animation:pulse-red 2s infinite; color:#ef4444; }
  `]
})
export class ParkHistoryComponent implements OnInit {
  records = signal<any[]>([]);
  loading = signal(true);
  billData = signal<any>(null);
  billRows = signal<{key:string,val:string}[]>([]);
  @ViewChild('billTpl') billTpl!: ElementRef;

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

  async downloadBill(row: any) {
    const [inH, inM] = row.intime.split(':').map(Number);
    const [outH, outM] = row.outtime.split(':').map(Number);
    const dur = Math.max(1, Math.ceil(((outH * 60 + outM) - (inH * 60 + inM)) / 60));
    this.billRows.set([
      { key: 'Vehicle No.', val: row.vehiclenumber },
      { key: 'Owner Name', val: row.ownername },
      { key: 'Vehicle Type', val: row.type === '2W' ? 'Two Wheeler' : 'Four Wheeler' },
      { key: 'Check-in', val: row.intime },
      { key: 'Check-out', val: row.outtime },
      { key: 'Duration', val: dur + ' hr' + (dur > 1 ? 's' : '') },
      { key: 'Payment', val: row.paymentStatus === 'completed' ? 'Completed' : 'Pending' },
    ]);
    this.billData.set(row);
    await new Promise(r => setTimeout(r, 100));
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(this.billTpl.nativeElement, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false });
    const link = document.createElement('a');
    link.download = `AuraPark-Bill-${row.vehiclenumber}-${row.date}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    this.billData.set(null);
  }

  getReceipt(id: string) {
    this.api.getReceipt(id).subscribe({
      next: (res) => alert(`Receipt\nVehicle: ${res.data.vehiclenumber}\nOwner: ${res.data.ownername}\nIn: ${res.data.intime} | Out: ${res.data.outtime}\nAmount: ₹${res.data.amount}`)
    });
  }
}
