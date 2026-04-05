import { Component, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
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
                <span *ngIf="row.source === 'online'" class="source-badge online"><i class="fa-solid fa-globe me-1"></i>Online</span>
                <span *ngIf="row.source !== 'online'" class="source-badge walkin"><i class="fa-solid fa-person-walking me-1"></i>Walk-in</span>
              </td>
              <td><small class="fw-semibold text-secondary">{{row.intime}}</small></td>
              <td><small class="fw-semibold text-success">{{row.amount ? '₹' + row.amount : '—'}}</small></td>
              <td class="text-end">
                <button class="btn btn-outline-danger btn-sm px-3 rounded-pill" (click)="openCheckout(row)" [disabled]="exiting() === row._id">
                  <span *ngIf="exiting() !== row._id">Checkout</span>
                  <span *ngIf="exiting() === row._id"><i class="fa-solid fa-spinner fa-spin"></i></span>
                </button>
              </td>
            </tr>
            <tr *ngIf="activeVehicles().length === 0">
              <td colspan="5" class="text-center py-5 text-muted">
                <i class="bi bi-info-circle d-block fs-2 mb-2"></i>No vehicles currently in the lot.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

<!-- Checkout Modal -->
<div class="modal-backdrop-custom" *ngIf="checkoutRecord()" (click)="closeModal()"></div>
<div class="checkout-modal" *ngIf="checkoutRecord()">
  <div class="modal-inner" #billEl>
    <!-- Bill Header -->
    <div class="bill-header">
      <div class="bill-brand">
        <span class="bill-logo">🅿</span>
        <div>
          <div class="bill-title">AuraPark</div>
          <div class="bill-sub">Parking Bill</div>
        </div>
      </div>
      <div class="text-end">
        <div class="bill-date-label">Date</div>
        <div class="bill-date-val">{{checkoutRecord()!.date}}</div>
      </div>
    </div>

    <!-- Vehicle Info -->
    <div class="bill-section">
      <div class="bill-row">
        <span class="bill-key">Vehicle No.</span>
        <span class="bill-val fw-bold font-monospace">{{checkoutRecord()!.vehiclenumber}}</span>
      </div>
      <div class="bill-row">
        <span class="bill-key">Owner Name</span>
        <span class="bill-val">{{checkoutRecord()!.ownername}}</span>
      </div>
      <div class="bill-row">
        <span class="bill-key">Vehicle Type</span>
        <span class="bill-val">{{checkoutRecord()!.type === '2W' ? 'Two Wheeler' : 'Four Wheeler'}}</span>
      </div>
      <div class="bill-row">
        <span class="bill-key">Check-in</span>
        <span class="bill-val text-success fw-bold">{{checkoutRecord()!.intime}}</span>
      </div>
      <div class="bill-row">
        <span class="bill-key">Check-out</span>
        <span class="bill-val text-danger fw-bold">{{checkoutTime()}}</span>
      </div>
      <div class="bill-row">
        <span class="bill-key">Duration</span>
        <span class="bill-val">{{checkoutDuration()}} hr{{checkoutDuration() > 1 ? 's' : ''}}</span>
      </div>
    </div>

    <div class="bill-divider dashed"></div>

    <!-- Amount -->
    <div class="bill-amount-row">
      <span>Total Amount</span>
      <span class="bill-amount">₹{{checkoutAmount()}}</span>
    </div>

    <!-- Payment Status -->
    <div class="bill-payment-status" [class.paid]="paymentDone()">
      <i class="fa-solid" [class.fa-clock]="!paymentDone()" [class.fa-circle-check]="paymentDone()"></i>
      {{paymentDone() ? 'Payment Received' : 'Payment Pending'}}
    </div>

    <!-- QR Code -->
    <div class="bill-qr-section" *ngIf="generatedQr()">
      <div class="qr-label">Scan to Pay · ₹{{checkoutAmount()}}</div>
      <img [src]="generatedQr()" class="qr-img">
      <div class="qr-upi">{{parkingUpi()}}</div>
      <div *ngIf="paymentDone()" class="qr-paid-badge"><i class="fa-solid fa-circle-check me-1"></i>Payment Received</div>
    </div>
    <div class="bill-qr-section" *ngIf="!generatedQr()">
      <div class="text-muted small"><i class="fa-solid fa-triangle-exclamation me-1 text-warning"></i>No UPI ID configured. Add it in Manage Parking.</div>
    </div>
  </div>

  <!-- Action Buttons (outside bill for no-print) -->
  <div class="modal-actions">
    <button class="btn btn-secondary" (click)="closeModal()">Close</button>
    <button class="btn btn-success px-4" *ngIf="!paymentDone()" (click)="confirmPayment()">
      <i class="fa-solid fa-check me-2"></i>Payment Received
    </button>
    <button class="btn btn-primary px-4" *ngIf="paymentDone()" (click)="downloadBill()">
      <i class="fa-solid fa-download me-2"></i>Download Bill
    </button>
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

    /* Modal */
    .modal-backdrop-custom { position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:1040; }
    .checkout-modal { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); z-index:1050; width:420px; max-width:95vw; max-height:92vh; overflow-y:auto; display:flex; flex-direction:column; gap:12px; scrollbar-width:thin; scrollbar-color:#cbd5e1 transparent; }
    .checkout-modal::-webkit-scrollbar { width:4px; }
    .checkout-modal::-webkit-scrollbar-track { background:transparent; }
    .checkout-modal::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:99px; }
    .checkout-modal::-webkit-scrollbar-thumb:hover { background:#94a3b8; }
    .modal-inner { background:white; border-radius:20px; overflow:visible; box-shadow:0 20px 60px rgba(0,0,0,0.2); }
    .modal-actions { display:flex; gap:10px; justify-content:flex-end; background:white; border-radius:14px; padding:14px 16px; box-shadow:0 4px 20px rgba(0,0,0,0.1); position:sticky; bottom:0; }

    /* Bill */
    .bill-header { display:flex; justify-content:space-between; align-items:center; padding:20px 24px 16px; background:linear-gradient(135deg,#0f172a,#1e293b); color:white; }
    .bill-brand { display:flex; align-items:center; gap:10px; }
    .bill-logo { font-size:1.8rem; }
    .bill-title { font-size:1.1rem; font-weight:800; }
    .bill-sub { font-size:0.7rem; color:rgba(255,255,255,0.5); }
    .bill-date-label { font-size:0.65rem; color:rgba(255,255,255,0.5); text-transform:uppercase; }
    .bill-date-val { font-size:0.85rem; font-weight:700; color:#10b981; }
    .bill-section { padding:16px 24px; }
    .bill-row { display:flex; justify-content:space-between; padding:7px 0; border-bottom:1px solid #f8fafc; font-size:0.88rem; }
    .bill-row:last-child { border-bottom:none; }
    .bill-key { color:#94a3b8; }
    .bill-val { color:#1e293b; }
    .bill-divider { height:1px; background:#f1f5f9; margin:0 24px; }
    .bill-divider.dashed { background:none; border-top:2px dashed #e2e8f0; }
    .bill-amount-row { display:flex; justify-content:space-between; align-items:center; padding:16px 24px; }
    .bill-amount-row span:first-child { font-size:1rem; font-weight:700; color:#1e293b; }
    .bill-amount { font-size:1.8rem; font-weight:800; color:#10b981; }
    .bill-payment-status { margin:0 24px 16px; padding:10px 16px; border-radius:10px; font-size:0.85rem; font-weight:700; display:flex; align-items:center; gap:8px; background:#fef9c3; color:#854d0e; }
    .bill-payment-status.paid { background:#dcfce7; color:#166534; }
    .bill-qr-section { padding:12px 24px 16px; text-align:center; border-top:1px solid #f1f5f9; }
    .qr-label { font-size:0.75rem; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; }
    .qr-img { width:240px; height:240px; object-fit:contain; border-radius:12px; border:2px solid #e2e8f0; }
    .qr-paid-badge { margin-top:8px; background:#dcfce7; color:#166534; padding:6px 16px; border-radius:20px; font-size:0.82rem; font-weight:700; display:inline-flex; align-items:center; }
    .qr-upi { font-size:0.8rem; color:#64748b; font-weight:600; margin-top:6px; font-family:monospace; }
  `]
})
export class ParkVehicleComponent implements OnInit {
  @ViewChild('billEl') billEl!: ElementRef;

  form = { ownername: '', vehiclenumber: '', type: '2W' };
  activeVehicles = signal<any[]>([]);
  loading = signal(true);
  saving = signal(false);
  exiting = signal<string | null>(null);
  successMsg = signal('');
  errorMsg = signal('');
  checkoutRecord = signal<any>(null);
  paymentDone = signal(false);
  parkingUpi = signal('');
  parkingUpiName = signal('');
  parkingRate = signal('20');
  generatedQr = signal('');
  checkoutTime = signal('');
  checkoutAmount = signal(0);
  checkoutDuration = signal(0);

  constructor(private api: AdminApiService) {}

  ngOnInit() {
    this.loadActive();
    this.api.getMyParking().subscribe({
      next: (res) => {
        this.parkingUpi.set(res.data?.upiId || '');
        this.parkingUpiName.set(res.data?.upiName || res.data?.parkingname || 'AuraPark');
        this.parkingRate.set(res.data?.hourrate || '20');
      }
    });
  }

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

  async openCheckout(row: any) {
    const now = new Date();
    const [inH, inM] = row.intime.split(':').map(Number);
    const outH = now.getHours(), outM = now.getMinutes();
    const dur = Math.max(1, Math.ceil(((outH * 60 + outM) - (inH * 60 + inM)) / 60));
    const rate = parseInt(this.parkingRate() || '20');
    const amount = dur * rate;
    this.checkoutTime.set(`${String(outH).padStart(2,'0')}:${String(outM).padStart(2,'0')}`);
    this.checkoutDuration.set(dur);
    this.checkoutAmount.set(amount);
    this.paymentDone.set(false);
    this.checkoutRecord.set({ ...row, _pendingExit: true });
    // Generate UPI QR
    if (this.parkingUpi()) {
      const upiUrl = `upi://pay?pa=${this.parkingUpi()}&pn=${encodeURIComponent(this.parkingUpiName())}&am=${amount}&cu=INR&tn=${encodeURIComponent('Parking Fee - ' + row.vehiclenumber)}`;
      const QRCode = (await import('qrcode'));
      const qrDataUrl = await QRCode.toDataURL(upiUrl, { width: 300, margin: 2, color: { dark: '#0f172a', light: '#ffffff' } });
      this.generatedQr.set(qrDataUrl);
    } else {
      this.generatedQr.set('');
    }
  }

  confirmPayment() {
    if (!confirm('Confirm that payment of ₹' + this.checkoutAmount() + ' has been received?')) return;
    const rec = this.checkoutRecord();
    // First exit the vehicle, then mark payment complete
    this.api.exitVehicle(rec._id).subscribe({
      next: (exitRes) => {
        this.activeVehicles.update(v => v.filter(x => x._id !== rec._id));
        this.api.completePayment(exitRes.data._id).subscribe({
          next: (payRes) => {
            this.paymentDone.set(true);
            this.checkoutRecord.set(payRes.data);
          }
        });
      }
    });
  }

  async downloadBill() {
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(this.billEl.nativeElement, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false });
    const link = document.createElement('a');
    link.download = `AuraPark-Bill-${this.checkoutRecord()!.vehiclenumber}-${this.checkoutRecord()!.date}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  closeModal() { this.checkoutRecord.set(null); this.paymentDone.set(false); }
}
