import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-manage-parking',
  imports: [FormsModule, CommonModule],
  template: `
<div class="container-fluid py-4">
  <div *ngIf="loading()" class="text-center py-5"><div class="spinner-border text-primary"></div></div>

  <ng-container *ngIf="!loading() && parking()">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-1">
            <li class="breadcrumb-item small"><a href="#">Admin</a></li>
            <li class="breadcrumb-item small active">Parking Details</li>
          </ol>
        </nav>
        <h2 class="fw-bold text-dark m-0">{{parking()!.parkingname}}</h2>
      </div>
      <button class="btn btn-primary px-4 shadow-sm" data-bs-toggle="modal" data-bs-target="#EditModal">
        <i class="fa-solid fa-pen-to-square me-2"></i> Edit Details
      </button>
    </div>

    <div class="row g-4">
      <div class="col-lg-7">
        <div class="detail-card mb-4">
          <h5 class="section-title"><i class="fa-solid fa-circle-info me-2"></i> Basic Operations</h5>
          <div class="info-group">
            <div class="info-label"><i class="fa-solid fa-car-side"></i> Vehicle Type</div>
            <div class="info-value">
              <span *ngIf="parking()!.type === 'Both'" class="badge bg-primary px-3">Bike & Car</span>
              <span *ngIf="parking()!.type !== 'Both'" class="badge bg-info px-3">{{parking()!.type}} Only</span>
            </div>
          </div>
          <div class="info-group">
            <div class="info-label"><i class="fa-solid fa-warehouse"></i> Total Capacity</div>
            <div class="info-value">
              <span class="me-3"><i class="fa-solid fa-motorcycle opacity-50"></i> {{parking()!.bikespace}}</span>
              <span><i class="fa-solid fa-car opacity-50"></i> {{parking()!.carspace}}</span>
            </div>
          </div>
          <div class="info-group">
            <div class="info-label"><i class="fa-solid fa-clock"></i> Operating Hours</div>
            <div class="info-value fw-bold text-primary">{{parking()!.operatinghours}}</div>
          </div>
          <div class="info-group">
            <div class="info-label"><i class="fa-solid fa-indian-rupee-sign"></i> Hourly Rate</div>
            <div class="info-value"><span class="rate-badge">₹ {{parking()!.hourrate}} / hr</span></div>
          </div>
        </div>

        <div class="detail-card">
          <h5 class="section-title"><i class="fa-solid fa-location-dot me-2"></i> Location Details</h5>
          <div class="info-group">
            <div class="info-label">Full Address</div>
            <div class="info-value text-muted small">{{parking()!.address}}</div>
          </div>
          <div class="row mt-3 g-3">
            <div class="col-6">
              <div class="p-3 bg-light rounded-3">
                <label class="small text-uppercase fw-bold text-muted d-block">City</label>
                <span class="fw-semibold">{{parking()!.city}}</span>
              </div>
            </div>
            <div class="col-6">
              <div class="p-3 bg-light rounded-3">
                <label class="small text-uppercase fw-bold text-muted d-block">State</label>
                <span class="fw-semibold">{{parking()!.state}}</span>
              </div>
            </div>
          </div>
          <div class="mt-4">
            <a [href]="parking()!.map" target="_blank" class="btn btn-outline-secondary btn-sm w-100 py-2">
              <i class="fa-solid fa-map-location-dot me-2"></i> View on Google Maps
            </a>
          </div>
        </div>
      </div>

      <div class="col-lg-5">
        <div class="park-img-wrapper mb-4">
          <img src="https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600" class="img-fluid w-100" style="object-fit:cover;height:300px;border-radius:16px" alt="Parking">
        </div>
        <div class="alert alert-info border-0 shadow-sm rounded-4 p-4">
          <h6 class="fw-bold"><i class="fa-solid fa-lightbulb me-2"></i> Quick Tip</h6>
          <p class="small m-0">Keep your hourly rates competitive for your area to increase daily occupancy.</p>
        </div>
      </div>
    </div>
  </ng-container>
</div>

<!-- Edit Modal -->
<div class="modal fade" id="EditModal" data-bs-backdrop="static" tabindex="-1">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content border-0 shadow">
      <div class="modal-header bg-light">
        <h5 class="modal-title fw-bold">Edit Parking Details</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body p-4" *ngIf="parking()">
        <div *ngIf="saveMsg()" class="alert alert-success py-2 small border-0 rounded-3 mb-3">
          <i class="fa-solid fa-circle-check me-2"></i>{{saveMsg()}}
        </div>
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label small fw-semibold">Parking Name</label>
            <input type="text" class="form-control" [(ngModel)]="editForm.parkingname">
          </div>
          <div class="col-md-6">
            <label class="form-label small fw-semibold">Hourly Rate (₹)</label>
            <input type="text" class="form-control" [(ngModel)]="editForm.hourrate">
          </div>
          <div class="col-md-6">
            <label class="form-label small fw-semibold">Operating Hours</label>
            <input type="text" class="form-control" [(ngModel)]="editForm.operatinghours">
          </div>
          <div class="col-md-6">
            <label class="form-label small fw-semibold">City</label>
            <input type="text" class="form-control" [(ngModel)]="editForm.city">
          </div>
          <div class="col-12">
            <label class="form-label small fw-semibold">Address</label>
            <textarea class="form-control" rows="2" [(ngModel)]="editForm.address"></textarea>
          </div>
          <div class="col-md-6">
            <label class="form-label small fw-semibold">Bike Spaces</label>
            <input type="text" class="form-control" [(ngModel)]="editForm.bikespace">
          </div>
          <div class="col-md-6">
            <label class="form-label small fw-semibold">Car Spaces</label>
            <input type="text" class="form-control" [(ngModel)]="editForm.carspace">
          </div>
        </div>
      </div>
      <div class="modal-footer bg-light">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-primary px-4" (click)="saveChanges()" [disabled]="saving()">
          <span *ngIf="!saving()">Save Changes</span>
          <span *ngIf="saving()"><i class="fa-solid fa-spinner fa-spin me-1"></i>Saving...</span>
        </button>
      </div>
    </div>
  </div>
</div>
  `,
  styles: [`
    .detail-card { background:#fff; border-radius:16px; box-shadow:0 4px 20px rgba(0,0,0,0.05); padding:24px; border:1px solid #f1f5f9; }
    .info-group { display:flex; padding:12px 0; border-bottom:1px solid #f8fafc; align-items:center; flex-wrap:wrap; }
    .info-group:last-child { border-bottom:none; }
    .info-label { flex:0 0 40%; min-width:140px; color:#64748b; font-weight:600; font-size:0.9rem; display:flex; align-items:center; }
    .info-label i { margin-right:10px; font-size:1.1rem; color:#94a3b8; }
    .info-value { flex:1; color:#1e293b; font-weight:500; }
    .section-title { font-size:1.1rem; font-weight:700; color:#0d6efd; margin-bottom:20px; padding-bottom:10px; border-bottom:2px solid #eef2ff; display:flex; align-items:center; }
    .rate-badge { background:#ecfdf5; color:#059669; padding:4px 12px; border-radius:99px; font-weight:700; display:inline-block; }
    .park-img-wrapper { border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.1); }
  `]
})
export class ManageParkingComponent implements OnInit {
  parking = signal<any>(null);
  loading = signal(true);
  saving = signal(false);
  saveMsg = signal('');
  editForm: any = {};

  constructor(private api: AdminApiService) {}

  ngOnInit() {
    this.api.getMyParking().subscribe({
      next: (res) => {
        this.parking.set(res.data);
        this.editForm = { ...res.data };
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
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
}
