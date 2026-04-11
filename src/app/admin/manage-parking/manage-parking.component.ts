import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-manage-parking',
  imports: [FormsModule, CommonModule],
  template: `
<div class="mp-wrap">
  <div *ngIf="loading()" class="text-center py-5"><div class="spinner-border text-primary"></div></div>
  <div *ngIf="!loading() && errorMsg()" class="alert alert-danger rounded-4 p-4">
    <i class="fa-solid fa-circle-exclamation me-2"></i>{{errorMsg()}}
  </div>

  <ng-container *ngIf="!loading() && parking()">

    <!-- Hero Banner -->
    <div class="mp-hero mb-4">
      <div class="mp-hero-overlay">
        <div class="d-flex justify-content-between align-items-end flex-wrap gap-3">
          <div>
            <div class="mp-badge mb-2"><i class="fa-solid fa-circle-check me-1"></i> Verified Parking</div>
            <h2 class="mp-hero-title mb-1">{{parking()!.parkingname}}</h2>
            <p class="mp-hero-sub mb-0"><i class="fa-solid fa-location-dot me-1"></i>{{parking()!.address}}, {{parking()!.city}}</p>
          </div>
          <button class="btn-edit-hero" data-bs-toggle="modal" data-bs-target="#EditModal">
            <i class="fa-solid fa-pen-to-square me-2"></i>Edit Details
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-lg-3">
        <div class="mp-stat">
          <div class="mp-stat-icon" style="background:#eff6ff;color:#3b82f6"><i class="fa-solid fa-motorcycle"></i></div>
          <div class="mp-stat-val">{{parking()!.bikespace}}</div>
          <div class="mp-stat-label">Bike Spaces</div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="mp-stat">
          <div class="mp-stat-icon" style="background:#f0fdf4;color:#16a34a"><i class="fa-solid fa-car"></i></div>
          <div class="mp-stat-val">{{parking()!.carspace}}</div>
          <div class="mp-stat-label">Car Spaces</div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="mp-stat">
          <div class="mp-stat-icon" style="background:#fef9c3;color:#854d0e"><i class="fa-solid fa-indian-rupee-sign"></i></div>
          <div class="mp-stat-val">₹{{parking()!.hourrate}}</div>
          <div class="mp-stat-label">Per Hour</div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="mp-stat">
          <div class="mp-stat-icon" style="background:#fdf4ff;color:#9333ea"><i class="fa-solid fa-clock"></i></div>
          <div class="mp-stat-val" style="font-size:0.95rem">{{parking()!.operatinghours}}</div>
          <div class="mp-stat-label">Operating Hours</div>
        </div>
      </div>
    </div>

    <div class="row g-4">

      <!-- Left — Details -->
      <div class="col-lg-7">

        <!-- Basic Info -->
        <div class="mp-card mb-4">
          <div class="mp-card-header">
            <i class="fa-solid fa-circle-info text-primary me-2"></i>
            <span>Parking Information</span>
          </div>
          <div class="mp-card-body">
            <div class="mp-row">
              <span class="mp-key">Vehicle Type</span>
              <span>
                <span *ngIf="parking()!.type === 'Both'" class="mp-tag mp-tag-blue"><i class="fa-solid fa-car me-1"></i><i class="fa-solid fa-motorcycle me-1"></i>Bike & Car</span>
                <span *ngIf="parking()!.type !== 'Both'" class="mp-tag mp-tag-blue">{{parking()!.type}} Only</span>
              </span>
            </div>
            <div class="mp-row">
              <span class="mp-key">Covered Parking</span>
              <span class="mp-tag" [class.mp-tag-green]="parking()!.covered" [class.mp-tag-gray]="!parking()!.covered">
                <i class="fa-solid" [class.fa-check]="parking()!.covered" [class.fa-xmark]="!parking()!.covered" class="me-1"></i>
                {{parking()!.covered ? 'Yes' : 'No'}}
              </span>
            </div>
            <div class="mp-row">
              <span class="mp-key">EV Charging</span>
              <span class="mp-tag" [class.mp-tag-green]="parking()!.evcharging" [class.mp-tag-gray]="!parking()!.evcharging">
                <i class="fa-solid" [class.fa-bolt]="parking()!.evcharging" [class.fa-xmark]="!parking()!.evcharging" class="me-1"></i>
                {{parking()!.evcharging ? 'Available' : 'Not Available'}}
              </span>
            </div>
            <div class="mp-row" style="border:none">
              <span class="mp-key">Owner</span>
              <span class="fw-semibold text-dark">{{parking()!.ownername}}</span>
            </div>
          </div>
        </div>

        <!-- Location -->
        <div class="mp-card">
          <div class="mp-card-header">
            <i class="fa-solid fa-location-dot text-danger me-2"></i>
            <span>Location Details</span>
          </div>
          <div class="mp-card-body">
            <div class="mp-row">
              <span class="mp-key">Address</span>
              <span class="text-muted small">{{parking()!.address}}</span>
            </div>
            <div class="mp-row">
              <span class="mp-key">City</span>
              <span class="fw-semibold">{{parking()!.city}}</span>
            </div>
            <div class="mp-row" style="border:none">
              <span class="mp-key">State</span>
              <span class="fw-semibold">{{parking()!.state}}</span>
            </div>
          </div>
          <div class="px-4 pb-4">
            <a [href]="parking()!.map" target="_blank" class="btn-maps w-100">
              <i class="fa-solid fa-map-location-dot me-2"></i>Open in Google Maps
            </a>
          </div>
        </div>
      </div>

      <!-- Right -->
      <div class="col-lg-5">

        <!-- Parking Image -->
        <div class="mp-img-card mb-4">
          <img src="https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600" alt="Parking" class="mp-img">
          <div class="mp-img-overlay">
            <span class="mp-img-badge"><i class="fa-solid fa-square-parking me-1"></i>{{parking()!.parkingname}}</span>
          </div>
        </div>

        <!-- UPI Card -->
        <div class="mp-card mb-4">
          <div class="mp-card-header">
            <i class="fa-solid fa-qrcode text-success me-2"></i>
            <span>Payment UPI</span>
          </div>
          <div class="mp-card-body">
            <div *ngIf="parking()!.upiId" class="upi-display mb-3">
              <div class="upi-icon"><i class="fa-solid fa-mobile-screen-button"></i></div>
              <div>
                <div class="fw-bold text-dark">{{parking()!.upiId}}</div>
                <div class="text-muted small">{{parking()!.upiName || 'UPI Payment'}}</div>
              </div>
            </div>
            <div *ngIf="!parking()!.upiId" class="text-center py-2 mb-3">
              <i class="fa-solid fa-indian-rupee-sign fs-2 text-muted d-block mb-1"></i>
              <span class="text-muted small">No UPI ID added yet</span>
            </div>
            <input type="text" class="mp-input mb-2" [(ngModel)]="upiIdInput" placeholder="e.g. name@paytm">
            <input type="text" class="mp-input mb-3" [(ngModel)]="upiNameInput" placeholder="Account holder name (optional)">
            <button class="btn-save-upi w-100" (click)="saveUpi()" [disabled]="qrSaving() || !upiIdInput.trim()">
              <span *ngIf="!qrSaving()"><i class="fa-solid fa-check me-2"></i>{{parking()!.upiId ? 'Update UPI ID' : 'Save UPI ID'}}</span>
              <span *ngIf="qrSaving()"><i class="fa-solid fa-spinner fa-spin me-2"></i>Saving...</span>
            </button>
            <div *ngIf="qrMsg()" class="mp-success-msg mt-2">
              <i class="fa-solid fa-circle-check me-1"></i>{{qrMsg()}}
            </div>
          </div>
        </div>

        <!-- Quick Tip -->
        <div class="mp-tip-card">
          <div class="mp-tip-icon"><i class="fa-solid fa-lightbulb"></i></div>
          <div>
            <div class="fw-bold mb-1" style="font-size:0.9rem">Pro Tip</div>
            <p class="mb-0 small text-muted">Keep your hourly rates competitive for your area to increase daily occupancy and attract more customers.</p>
          </div>
        </div>

      </div>
    </div>
  </ng-container>
</div>

<!-- Edit Modal -->
<div class="modal fade" id="EditModal" data-bs-backdrop="static" tabindex="-1">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
      <div class="modal-header border-0 px-4 pt-4 pb-0">
        <div>
          <h5 class="modal-title fw-bold mb-0">Edit Parking Details</h5>
          <p class="text-muted small mb-0">Update your parking information below</p>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body p-4" *ngIf="parking()">
        <div *ngIf="saveMsg()" class="alert alert-success py-2 small border-0 rounded-3 mb-3">
          <i class="fa-solid fa-circle-check me-2"></i>{{saveMsg()}}
        </div>
        <div class="row g-3">
          <div class="col-md-6">
            <label class="mp-field-label">Parking Name</label>
            <input type="text" class="mp-field-input" [(ngModel)]="editForm.parkingname">
          </div>
          <div class="col-md-6">
            <label class="mp-field-label">Hourly Rate (₹)</label>
            <input type="text" class="mp-field-input" [(ngModel)]="editForm.hourrate">
          </div>
          <div class="col-md-6">
            <label class="mp-field-label">Operating Hours</label>
            <input type="text" class="mp-field-input" [(ngModel)]="editForm.operatinghours">
          </div>
          <div class="col-md-6">
            <label class="mp-field-label">City</label>
            <input type="text" class="mp-field-input" [(ngModel)]="editForm.city">
          </div>
          <div class="col-12">
            <label class="mp-field-label">Address</label>
            <textarea class="mp-field-input" rows="2" [(ngModel)]="editForm.address"></textarea>
          </div>
          <div class="col-md-6">
            <label class="mp-field-label">Bike Spaces</label>
            <input type="text" class="mp-field-input" [(ngModel)]="editForm.bikespace">
          </div>
          <div class="col-md-6">
            <label class="mp-field-label">Car Spaces</label>
            <input type="text" class="mp-field-input" [(ngModel)]="editForm.carspace">
          </div>
        </div>
      </div>
      <div class="modal-footer border-0 px-4 pb-4 pt-0 gap-2">
        <button type="button" class="btn btn-light px-4 rounded-3" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-primary px-5 rounded-3" (click)="saveChanges()" [disabled]="saving()">
          <span *ngIf="!saving()"><i class="fa-solid fa-floppy-disk me-2"></i>Save Changes</span>
          <span *ngIf="saving()"><i class="fa-solid fa-spinner fa-spin me-2"></i>Saving...</span>
        </button>
      </div>
    </div>
  </div>
</div>
  `,
  styles: [`
    .mp-wrap { padding: 4px 0; }

    /* Hero */
    .mp-hero { background: linear-gradient(135deg, #0f172a, #1e3a5f); border-radius: 20px; overflow: hidden; min-height: 160px; position: relative; }
    .mp-hero::before { content: ''; position: absolute; inset: 0; background: url('https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800') center/cover; opacity: 0.15; }
    .mp-hero-overlay { position: relative; padding: 28px 32px; }
    .mp-badge { display: inline-flex; align-items: center; background: rgba(16,185,129,0.2); color: #10b981; border: 1px solid rgba(16,185,129,0.3); padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; }
    .mp-hero-title { font-size: 1.8rem; font-weight: 800; color: white; letter-spacing: -0.5px; }
    .mp-hero-sub { color: rgba(255,255,255,0.6); font-size: 0.85rem; }
    .btn-edit-hero { background: white; color: #0f172a; border: none; border-radius: 12px; padding: 10px 20px; font-weight: 700; font-size: 0.88rem; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
    .btn-edit-hero:hover { background: #f1f5f9; transform: translateY(-1px); }

    /* Stats */
    .mp-stat { background: white; border-radius: 16px; padding: 18px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); text-align: center; height: 100%; }
    .mp-stat-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; margin: 0 auto 10px; }
    .mp-stat-val { font-size: 1.4rem; font-weight: 800; color: #0f172a; line-height: 1; margin-bottom: 4px; }
    .mp-stat-label { font-size: 0.72rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

    /* Cards */
    .mp-card { background: white; border-radius: 18px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); overflow: hidden; }
    .mp-card-header { display: flex; align-items: center; padding: 18px 24px 14px; font-weight: 700; color: #1e293b; font-size: 0.95rem; border-bottom: 1px solid #f1f5f9; }
    .mp-card-body { padding: 8px 24px 16px; }
    .mp-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f8fafc; gap: 12px; }
    .mp-key { font-size: 0.82rem; color: #94a3b8; font-weight: 600; flex-shrink: 0; }
    .mp-tag { padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; }
    .mp-tag-blue { background: #eff6ff; color: #1d4ed8; }
    .mp-tag-green { background: #dcfce7; color: #166534; }
    .mp-tag-gray { background: #f1f5f9; color: #64748b; }

    /* Maps Button */
    .btn-maps { display: flex; align-items: center; justify-content: center; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 10px; font-size: 0.88rem; font-weight: 600; color: #475569; text-decoration: none; transition: all 0.2s; }
    .btn-maps:hover { background: #eff6ff; border-color: #3b82f6; color: #1d4ed8; }

    /* Image Card */
    .mp-img-card { border-radius: 18px; overflow: hidden; position: relative; box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
    .mp-img { width: 100%; height: 200px; object-fit: cover; display: block; }
    .mp-img-overlay { position: absolute; bottom: 0; left: 0; right: 0; padding: 12px 16px; background: linear-gradient(to top, rgba(0,0,0,0.7), transparent); }
    .mp-img-badge { color: white; font-size: 0.82rem; font-weight: 700; }

    /* UPI */
    .upi-display { display: flex; align-items: center; gap: 12px; background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 12px; padding: 12px 16px; }
    .upi-icon { width: 40px; height: 40px; background: #dcfce7; color: #16a34a; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; }
    .mp-input { width: 100%; padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 0.88rem; color: #1e293b; outline: none; transition: border-color 0.2s; display: block; }
    .mp-input:focus { border-color: #10b981; }
    .btn-save-upi { background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; border-radius: 12px; padding: 11px; font-weight: 700; font-size: 0.88rem; cursor: pointer; transition: all 0.2s; }
    .btn-save-upi:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(16,185,129,0.3); }
    .btn-save-upi:disabled { opacity: 0.6; cursor: not-allowed; }
    .mp-success-msg { background: #f0fdf4; color: #166534; border-radius: 8px; padding: 8px 12px; font-size: 0.82rem; font-weight: 600; }

    /* Tip */
    .mp-tip-card { background: linear-gradient(135deg, #fffbeb, #fef3c7); border: 1.5px solid #fde68a; border-radius: 16px; padding: 18px; display: flex; gap: 14px; align-items: flex-start; }
    .mp-tip-icon { width: 40px; height: 40px; background: #f59e0b; color: white; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; }

    /* Modal Fields */
    .mp-field-label { font-size: 0.78rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px; }
    .mp-field-input { width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 0.9rem; color: #1e293b; outline: none; transition: border-color 0.2s; }
    .mp-field-input:focus { border-color: #0d6efd; box-shadow: 0 0 0 3px rgba(13,110,253,0.1); }

    @media (max-width: 576px) {
      .mp-hero-overlay { padding: 20px; }
      .mp-hero-title { font-size: 1.3rem; }
      .mp-stat-val { font-size: 1.1rem; }
    }
  `]
})
export class ManageParkingComponent implements OnInit {
  parking = signal<any>(null);
  loading = signal(true);
  saving = signal(false);
  saveMsg = signal('');
  errorMsg = signal('');
  qrSaving = signal(false);
  qrMsg = signal('');
  upiIdInput = '';
  upiNameInput = '';
  editForm: any = {};

  constructor(private api: AdminApiService) {}

  ngOnInit() {
    this.api.getMyParking().subscribe({
      next: (res) => {
        this.parking.set(res.data);
        this.editForm = { ...res.data };
        this.upiIdInput = res.data?.upiId || '';
        this.upiNameInput = res.data?.upiName || '';
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'Failed to load parking data.');
        this.loading.set(false);
      }
    });
  }

  saveChanges() {
    this.saving.set(true); this.saveMsg.set('');
    this.api.updateMyParking(this.editForm).subscribe({
      next: (res) => {
        this.parking.set(res.data);
        this.saveMsg.set('Changes saved successfully!');
        this.saving.set(false);
        setTimeout(() => this.saveMsg.set(''), 2000);
      },
      error: () => this.saving.set(false)
    });
  }

  saveUpi() {
    this.qrSaving.set(true);
    this.api.updateMyParking({ upiId: this.upiIdInput.trim(), upiName: this.upiNameInput.trim() }).subscribe({
      next: (res) => {
        this.parking.update(p => ({ ...p, upiId: res.data.upiId, upiName: res.data.upiName }));
        this.qrSaving.set(false);
        this.qrMsg.set('UPI ID saved successfully!');
        setTimeout(() => this.qrMsg.set(''), 3000);
      },
      error: () => this.qrSaving.set(false)
    });
  }
}
