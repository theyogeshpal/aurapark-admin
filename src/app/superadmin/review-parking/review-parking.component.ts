import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-review-parking',
  imports: [CommonModule],
  template: `
<div class="container-fluid py-4">
  <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap">
    <h2 class="fw-bold text-dark m-0">Pending Requests <span class="badge bg-primary rounded-pill fs-6">{{spots().length}}</span></h2>
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb mb-0">
        <li class="breadcrumb-item"><a href="#">Dashboard</a></li>
        <li class="breadcrumb-item active">Requests</li>
      </ol>
    </nav>
  </div>

  <div *ngIf="loading()" class="text-center py-5"><div class="spinner-border text-primary"></div></div>

  <div class="table-container" *ngIf="!loading()">
    <div class="table-responsive">
      <table class="table align-middle table-hover">
        <thead>
          <tr>
            <th class="text-center">#</th>
            <th>Owner Info</th>
            <th>Parking Details</th>
            <th>Location</th>
            <th class="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of spots(); let i = index">
            <td class="text-center sr-col fs-3">{{(i+1).toString().padStart(2,'0')}}</td>
            <td class="owner-info">
              <b class="fs-6">{{row.ownername}}</b>
              <div class="small text-muted">
                <i class="fa-solid fa-envelope me-1"></i> {{row.email}}<br>
                <i class="fa-solid fa-phone me-1"></i> {{row.mobile}}
              </div>
            </td>
            <td>
              <div class="fw-bold text-dark">{{row.parkingname}}</div>
              <div class="mt-1">
                <span class="badge badge-soft text-dark">₹{{row.hourrate}}/hr</span>
                <span class="badge bg-light text-secondary border ms-1">{{row.type}}</span>
              </div>
              <small class="text-muted d-block mt-1"><i class="fa-regular fa-clock"></i> {{row.operatinghours}}</small>
            </td>
            <td style="max-width:250px">
              <div class="text-truncate small">
                <i class="fa-solid fa-location-dot text-danger me-1"></i>
                <strong>{{row.city}}, {{row.state}}</strong><br>
                <span class="text-secondary">{{row.address}}</span>
              </div>
              <a [href]="row.map" target="_blank" class="btn btn-sm btn-link p-0 mt-1 text-decoration-none">View on Map &rarr;</a>
            </td>
            <td class="text-end">
              <div class="btn-group shadow-sm">
                <a class="btn btn-white btn-action border" [href]="'tel:'+row.mobile" title="Call"><i class="fa-solid fa-phone text-primary"></i></a>
                <button class="btn btn-white btn-action border text-success" (click)="verifySpot(row._id)" title="Approve"><i class="fa-solid fa-check"></i></button>
                <button class="btn btn-white btn-action border text-danger" (click)="deleteSpot(row._id)" title="Reject"><i class="fa-solid fa-xmark"></i></button>
              </div>
            </td>
          </tr>
          <tr *ngIf="spots().length === 0">
            <td colspan="5" class="text-center py-5 text-muted">
              <i class="fa-solid fa-check-circle fs-2 d-block mb-2 text-success"></i>No pending requests!
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
  `,
  styles: [`
    .table-container { background:white; padding:20px; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.05); }
    .sr-col { font-family:'Segoe UI',sans-serif; font-weight:700; color:#dee2e6; vertical-align:middle !important; }
    .owner-info b { color:#4b3869; display:block; margin-bottom:4px; }
    .badge-soft { background-color:#eef2ff; color:#4338ca; border:1px solid #e0e7ff; padding:5px 10px; }
    .btn-action { width:38px; height:38px; display:inline-flex; align-items:center; justify-content:center; border-radius:8px; transition:0.2s; }
    .table thead th { background-color:#f8f9fa; color:#495057; text-transform:uppercase; font-size:0.75rem; letter-spacing:0.05em; border:none; }
  `]
})
export class ReviewParkingComponent implements OnInit {
  spots = signal<any[]>([]);
  loading = signal(true);

  constructor(private api: AdminApiService) {}

  ngOnInit() {
    this.api.getPendingParkings().subscribe({
      next: (res) => { this.spots.set(res.data || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  verifySpot(id: string) {
    (window as any).Swal.fire({ title: 'Approve Parking?', text: 'This spot will be listed publicly and admin account will be created.', icon: 'question', showCancelButton: true, confirmButtonColor: '#10b981', confirmButtonText: 'Yes, Approve' }).then((r: any) => {
      if (!r.isConfirmed) return;
      this.api.verifyParking(id).subscribe({
        next: () => { this.spots.update(s => s.filter(x => x._id !== id)); (window as any).Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Parking approved & admin created!', showConfirmButton: false, timer: 3000 }); },
        error: (err: any) => (window as any).Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: err.error?.message || 'Approval failed', showConfirmButton: false, timer: 3000 })
      });
    });
  }

  deleteSpot(id: string) {
    (window as any).Swal.fire({ title: 'Reject Request?', text: 'This parking request will be deleted.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#e11d48', confirmButtonText: 'Yes, Reject' }).then((r: any) => {
      if (!r.isConfirmed) return;
      this.api.deleteParking(id).subscribe({
        next: () => { this.spots.update(s => s.filter(x => x._id !== id)); (window as any).Swal.fire({ toast: true, position: 'top-end', icon: 'info', title: 'Request rejected', showConfirmButton: false, timer: 2500 }); },
        error: (err: any) => (window as any).Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: err.error?.message || 'Delete failed', showConfirmButton: false, timer: 3000 })
      });
    });
  }
}
