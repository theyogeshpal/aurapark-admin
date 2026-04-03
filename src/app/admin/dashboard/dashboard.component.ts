import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  template: `
<div class="dashboard-wrapper">
  <div class="page-header d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
    <div>
      <h1 class="h3 fw-bold mb-1">System Overview</h1>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb mb-0">
          <li class="breadcrumb-item text-muted">{{data()?.parkingName || 'Loading...'}}</li>
          <li class="breadcrumb-item active fw-semibold text-primary">Admin Panel</li>
        </ol>
      </nav>
    </div>
    <div class="d-flex gap-2">
      <button class="btn btn-white border bg-white shadow-sm btn-sm px-3">
        <i class="bi bi-calendar3 me-2"></i>{{currentDate}}
      </button>
      <a routerLink="/admin/park-vehicle" class="btn btn-primary btn-sm px-3 shadow-sm">
        <i class="bi bi-plus-lg me-1"></i> Entry
      </a>
    </div>
  </div>

  <div *ngIf="loading()" class="text-center py-5"><div class="spinner-border text-primary"></div></div>

  <ng-container *ngIf="!loading() && data()">
    <div class="row g-3 mb-4">
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="stat-card card-blue p-4">
          <div class="d-flex items-center justify-content-between mb-3">
            <div class="icon-box bg-primary bg-opacity-10 text-primary rounded p-2"><i class="bi bi-car-front-fill"></i></div>
            <span class="badge text-white" [class.text-success]="data()!.incrementRate >= 0" [class.bg-success]="data()!.incrementRate >= 0" [class.text-danger]="data()!.incrementRate < 0" [class.bg-danger]="data()!.incrementRate < 0" style="background-opacity:0.1">{{data()!.incrementRate >= 0 ? '+' : ''}}{{data()!.incrementRate}}%</span>
          </div>
          <div class="val-text">{{data()!.todayParking}}</div>
          <div class="text-muted small fw-medium text-center">Today's Parked Vehicles</div>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="stat-card card-purple p-4">
          <div class="d-flex justify-content-between mb-3">
            <div class="icon-box rounded p-2" style="background:rgba(139,92,246,0.1);color:#8b5cf6"><i class="bi bi-clock-history"></i></div>
            <span class="badge bg-light text-muted">Life-time</span>
          </div>
          <div class="val-text">{{data()!.totalParking}}</div>
          <div class="text-muted small fw-medium text-center">Total Historical Entries</div>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="stat-card card-green p-4">
          <div class="d-flex justify-content-between mb-3">
            <div class="icon-box bg-success bg-opacity-10 text-success rounded p-2"><i class="bi bi-currency-rupee"></i></div>
            <span class="badge bg-success bg-opacity-10 text-success">Live</span>
          </div>
          <div class="val-text">₹{{data()!.todayRevenue | number}}</div>
          <div class="text-muted small fw-medium text-center">Today's Revenue</div>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="stat-card card-orange p-4">
          <div class="d-flex justify-content-between mb-3">
            <div class="icon-box bg-warning bg-opacity-10 text-warning rounded p-2"><i class="bi bi-wallet2"></i></div>
            <span class="badge bg-warning bg-opacity-10 text-warning">Processed</span>
          </div>
          <div class="val-text">₹{{data()!.totalRevenue | number}}</div>
          <div class="text-muted small fw-medium text-center">Total Revenue Collected</div>
        </div>
      </div>
    </div>

    <div class="row g-4">
      <div class="col-12 col-lg-8">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header border-0 bg-transparent pt-4"><h5 class="fw-bold">Traffic Analysis (This Week)</h5></div>
          <div class="card-body">
            <div class="d-flex align-items-end gap-2" style="height:250px">
              <div *ngFor="let bar of data()!.weeklyChart" class="d-flex flex-column align-items-center flex-grow-1">
                <small class="text-muted mb-1" style="font-size:0.65rem">{{bar.count}}</small>
                <div class="bg-primary" [style.height.%]="getBarHeight(bar.count)" style="width:100%;border-radius:6px 6px 0 0;min-height:4px"></div>
                <small class="text-muted mt-1" style="font-size:0.7rem">{{bar.day}}</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-lg-4">
        <div class="weather-container shadow-sm mb-4">
          <div class="weather-glass">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="text-uppercase small" style="letter-spacing:2px">{{data()!.city}}</h6>
                <div class="opacity-75 small">Clear Sky</div>
                <div class="mt-2"><span style="font-size:2.5rem;font-weight:800">28</span><span class="fs-3">°C</span></div>
              </div>
              <i class="bi bi-cloud-sun fs-1"></i>
            </div>
            <div class="mt-4 pt-3 border-top border-white border-opacity-20 d-flex justify-content-between">
              <div><div class="small opacity-50">FEELS LIKE</div><span class="fw-bold">30°</span></div>
              <div class="text-end"><div class="small opacity-50">HUMIDITY</div><span class="fw-bold">65%</span></div>
            </div>
          </div>
        </div>

        <div class="availability-card p-4 shadow-sm">
          <div class="d-flex align-items-center mb-4">
            <div class="me-3 rounded p-2" style="background:rgba(255,255,255,0.1)"><i class="bi bi-p-square-fill text-info"></i></div>
            <div><h5 class="mb-0 fw-bold">Live Capacity</h5><small class="text-info opacity-75">Real-time update</small></div>
          </div>
          <div class="mb-4">
            <div class="d-flex justify-content-between mb-2">
              <span class="small opacity-75">Available Spaces</span>
              <span class="fw-bold">{{data()!.availableSpaces}} <small class="opacity-50">/ {{data()!.totalSpaces}}</small></span>
            </div>
            <div class="progress" style="height:10px;background:rgba(255,255,255,0.1);border-radius:10px">
              <div class="progress-bar bg-info" [style.width.%]="100 - data()!.occupancyPercent" style="box-shadow:0 0 15px rgba(13,202,240,0.5)"></div>
            </div>
          </div>
          <div class="p-3 rounded-4" style="background:rgba(0,0,0,0.05)">
            <div class="d-flex align-items-center gap-3">
              <i class="bi bi-lightning-charge-fill text-warning"></i>
              <div class="small"><div class="fw-bold">Occupancy: {{data()!.occupancyPercent}}%</div><div class="opacity-50">{{data()!.activeVehicles}} vehicles currently parked.</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ng-container>
</div>
  `,
  styles: [`
    .stat-card { background:white; border:none; border-radius:16px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1); transition:all 0.3s ease; position:relative; height:100%; overflow:hidden; display:flex; flex-direction:column; justify-content:center; }
    .stat-card:hover { transform:translateY(-5px); box-shadow:0 10px 15px -3px rgba(0,0,0,0.1); }
    .stat-card::before { content:""; position:absolute; top:0; left:0; width:5px; height:100%; }
    .card-blue::before { background:#3b82f6; } .card-green::before { background:#10b981; } .card-purple::before { background:#8b5cf6; } .card-orange::before { background:#f59e0b; }
    .val-text { font-size:1.5rem; font-weight:800; color:#1f2937; text-align:center; }
    .weather-container { border-radius:24px; overflow:hidden; background:linear-gradient(45deg,#0d6efd,#6610f2); min-height:200px; }
    .weather-glass { background:rgba(255,255,255,0.1); backdrop-filter:blur(12px); padding:24px; color:white; }
    .availability-card { background:#1e293b; color:white; border-radius:24px; }
  `]
})
export class DashboardComponent implements OnInit {
  currentDate = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  data = signal<any>(null);
  loading = signal(true);

  constructor(private api: AdminApiService) {}

  ngOnInit() {
    this.api.getDashboard().subscribe({
      next: (res) => { this.data.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  getBarHeight(count: number): number {
    const max = Math.max(...(this.data()?.weeklyChart?.map((b: any) => b.count) || [1]));
    return max > 0 ? Math.max(5, (count / max) * 100) : 5;
  }
}
