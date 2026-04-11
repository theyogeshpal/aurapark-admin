import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminApiService } from '../../services/admin-api.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  template: `
<div class="dash-wrap">

  <!-- Header -->
  <div class="dash-header mb-4">
    <div>
      <h1 class="dash-title">Dashboard</h1>
      <p class="dash-sub mb-0">{{data()?.parkingName || '...'}} &nbsp;·&nbsp; {{currentDate}}</p>
    </div>
    <div class="d-flex gap-2 align-items-center">
      <button class="btn btn-outline-secondary btn-sm px-3" (click)="load()" [disabled]="loading()">
        <i class="bi bi-arrow-clockwise" [class.spin]="loading()"></i>
      </button>
      <a routerLink="/admin/park-vehicle" class="btn btn-primary px-4 shadow-sm">
        <i class="bi bi-plus-lg me-2"></i>New Entry
      </a>
    </div>
  </div>

  <div *ngIf="loading()" class="text-center py-5"><div class="spinner-border text-primary"></div></div>

  <ng-container *ngIf="!loading() && data()">

    <!-- Stat Cards -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-xl-3">
        <div class="scard scard-blue">
          <div class="scard-icon"><i class="bi bi-car-front-fill"></i></div>
          <div class="scard-val">{{data()!.todayParking}}</div>
          <div class="scard-label">Today's Vehicles</div>
          <div class="scard-badge" [class.up]="data()!.incrementRate >= 0" [class.down]="data()!.incrementRate < 0">
            <i class="bi" [class.bi-arrow-up]="data()!.incrementRate >= 0" [class.bi-arrow-down]="data()!.incrementRate < 0"></i>
            {{data()!.incrementRate >= 0 ? '+' : ''}}{{data()!.incrementRate}}% vs yesterday
          </div>
        </div>
      </div>
      <div class="col-6 col-xl-3">
        <div class="scard scard-green">
          <div class="scard-icon"><i class="bi bi-currency-rupee"></i></div>
          <div class="scard-val">₹{{data()!.todayRevenue | number}}</div>
          <div class="scard-label">Today's Revenue</div>
          <div class="scard-badge up"><i class="bi bi-graph-up-arrow"></i> Live</div>
        </div>
      </div>
      <div class="col-6 col-xl-3">
        <div class="scard scard-purple">
          <div class="scard-icon"><i class="bi bi-calendar-check"></i></div>
          <div class="scard-val">{{data()!.prebookedCount}}</div>
          <div class="scard-label">Pending Pre-Bookings</div>
          <a routerLink="/admin/prebookings" class="scard-badge up" style="text-decoration:none">
            <i class="bi bi-arrow-right-circle"></i> View All
          </a>
        </div>
      </div>
      <div class="col-6 col-xl-3">
        <div class="scard scard-orange">
          <div class="scard-icon"><i class="bi bi-wallet2"></i></div>
          <div class="scard-val">₹{{data()!.totalRevenue | number}}</div>
          <div class="scard-label">Total Revenue</div>
          <div class="scard-badge up"><i class="bi bi-check-circle"></i> All Time</div>
        </div>
      </div>
    </div>

    <div class="row g-4 mb-4">

      <!-- Weekly Chart -->
      <div class="col-lg-8">
        <div class="dash-card h-100">
          <div class="dash-card-header">
            <div>
              <h5 class="mb-0 fw-bold">Weekly Traffic</h5>
              <small class="text-muted">Vehicles parked per day this week</small>
            </div>
          </div>
          <div class="chart-area">
            <div class="chart-bars">
              <div *ngFor="let bar of data()!.weeklyChart" class="chart-col">
                <div class="bar-val">{{bar.count}}</div>
                <div class="bar-fill" [style.height.%]="getBarHeight(bar.count)">
                  <div class="bar-inner"></div>
                </div>
                <div class="bar-label">{{bar.day}}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Capacity -->
      <div class="col-lg-4">
        <div class="dash-card h-100">
          <div class="dash-card-header">
            <h5 class="mb-0 fw-bold">Live Capacity</h5>
          </div>
          <div class="p-4">
            <!-- Donut -->
            <div class="donut-wrap">
              <svg viewBox="0 0 120 120" class="donut-svg">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" stroke-width="14"/>
                <circle cx="60" cy="60" r="50" fill="none" stroke="#3b82f6" stroke-width="14"
                  stroke-dasharray="314"
                  [attr.stroke-dashoffset]="314 - (314 * data()!.occupancyPercent / 100)"
                  stroke-linecap="round"
                  transform="rotate(-90 60 60)"/>
              </svg>
              <div class="donut-center">
                <div class="donut-pct">{{data()!.occupancyPercent}}%</div>
                <div class="donut-sub">Occupied</div>
              </div>
            </div>
            <div class="capacity-stats mt-3">
              <div class="cap-row">
                <span class="cap-dot" style="background:#3b82f6"></span>
                <span class="cap-label">Active</span>
                <span class="cap-val fw-bold">{{data()!.activeVehicles}}</span>
              </div>
              <div class="cap-row">
                <span class="cap-dot" style="background:#10b981"></span>
                <span class="cap-label">Available</span>
                <span class="cap-val fw-bold text-success">{{data()!.availableSpaces}}</span>
              </div>
              <div class="cap-row">
                <span class="cap-dot" style="background:#e2e8f0"></span>
                <span class="cap-label">Total</span>
                <span class="cap-val fw-bold">{{data()!.totalSpaces}}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="dash-card">
      <div class="dash-card-header">
        <div>
          <h5 class="mb-0 fw-bold">Recent Activity</h5>
          <small class="text-muted">Last 5 parking entries</small>
        </div>
        <a routerLink="/admin/park-history" class="btn btn-sm btn-outline-primary">View All</a>
      </div>
      <div class="table-responsive">
        <table class="table act-table mb-0">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Owner</th>
              <th>Type</th>
              <th>Date</th>
              <th>In</th>
              <th>Status</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of data()!.recentActivity">
              <td class="font-monospace fw-bold">{{r.vehiclenumber}}</td>
              <td>{{r.ownername}}</td>
              <td>
                <span class="type-badge" [class.bike]="r.type==='2W'" [class.car]="r.type==='4W'">
                  <i class="fa-solid" [class.fa-motorcycle]="r.type==='2W'" [class.fa-car]="r.type==='4W'"></i>
                  {{r.type}}
                </span>
              </td>
              <td class="text-muted small">{{r.date}}</td>
              <td class="text-muted small">{{r.intime}}</td>
              <td>
                <span class="status-dot" [class.active]="r.outtime==='-'" [class.done]="r.outtime!=='-'">
                  {{r.outtime === '-' ? 'Parked' : 'Exited'}}
                </span>
              </td>
              <td class="fw-bold text-success">{{r.amount ? '₹'+r.amount : '—'}}</td>
            </tr>
            <tr *ngIf="!data()!.recentActivity?.length">
              <td colspan="7" class="text-center text-muted py-4">No activity yet</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </ng-container>
</div>
  `,
  styles: [`
    .dash-wrap { padding: 4px 0; }
    .dash-header { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; }
    .dash-title { font-size:1.6rem; font-weight:800; color:#0f172a; margin:0; }
    .dash-sub { color:#94a3b8; font-size:0.85rem; }
    .spin { animation: spin 1s linear infinite; display:inline-block; }
    @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }

    /* Stat Cards */
    .scard { background:white; border-radius:18px; padding:20px; box-shadow:0 2px 12px rgba(0,0,0,0.06); position:relative; overflow:hidden; height:100%; }
    .scard::after { content:''; position:absolute; width:80px; height:80px; border-radius:50%; top:-20px; right:-20px; opacity:0.08; }
    .scard-blue::after { background:#3b82f6; } .scard-green::after { background:#10b981; } .scard-purple::after { background:#8b5cf6; } .scard-orange::after { background:#f59e0b; }
    .scard-icon { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.1rem; margin-bottom:12px; }
    .scard-blue .scard-icon { background:#eff6ff; color:#3b82f6; }
    .scard-green .scard-icon { background:#f0fdf4; color:#10b981; }
    .scard-purple .scard-icon { background:#f5f3ff; color:#8b5cf6; }
    .scard-orange .scard-icon { background:#fffbeb; color:#f59e0b; }
    .scard-val { font-size:1.6rem; font-weight:800; color:#0f172a; line-height:1; margin-bottom:4px; }
    .scard-label { font-size:0.78rem; color:#94a3b8; font-weight:600; margin-bottom:10px; }
    .scard-badge { font-size:0.72rem; font-weight:700; padding:3px 8px; border-radius:20px; display:inline-flex; align-items:center; gap:4px; }
    .scard-badge.up { background:#f0fdf4; color:#16a34a; }
    .scard-badge.down { background:#fef2f2; color:#dc2626; }

    /* Dash Card */
    .dash-card { background:white; border-radius:18px; box-shadow:0 2px 12px rgba(0,0,0,0.06); overflow:hidden; margin-bottom:0; }
    .dash-card-header { display:flex; justify-content:space-between; align-items:center; padding:20px 24px 16px; border-bottom:1px solid #f1f5f9; }

    /* Chart */
    .chart-area { padding:20px 24px 16px; }
    .chart-bars { display:flex; align-items:flex-end; gap:8px; height:200px; }
    .chart-col { flex:1; display:flex; flex-direction:column; align-items:center; height:100%; justify-content:flex-end; }
    .bar-val { font-size:0.65rem; color:#94a3b8; margin-bottom:4px; font-weight:600; }
    .bar-fill { width:100%; display:flex; align-items:flex-end; min-height:4px; }
    .bar-inner { width:100%; background:linear-gradient(180deg,#3b82f6,#6366f1); border-radius:6px 6px 0 0; height:100%; transition:height 0.5s; }
    .bar-label { font-size:0.68rem; color:#94a3b8; margin-top:6px; font-weight:700; }

    /* Donut */
    .donut-wrap { position:relative; width:160px; margin:0 auto; }
    .donut-svg { width:100%; }
    .donut-center { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); text-align:center; }
    .donut-pct { font-size:1.6rem; font-weight:800; color:#0f172a; line-height:1; }
    .donut-sub { font-size:0.72rem; color:#94a3b8; font-weight:600; }
    .capacity-stats { border-top:1px solid #f1f5f9; padding-top:16px; }
    .cap-row { display:flex; align-items:center; gap:10px; padding:6px 0; }
    .cap-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
    .cap-label { flex:1; font-size:0.85rem; color:#64748b; }
    .cap-val { font-size:0.9rem; color:#1e293b; }

    /* Table */
    .act-table thead th { background:#f8fafc; font-size:0.72rem; text-transform:uppercase; letter-spacing:0.5px; color:#94a3b8; font-weight:700; padding:12px 16px; border:none; }
    .act-table tbody td { padding:12px 16px; vertical-align:middle; border-bottom:1px solid #f8fafc; font-size:0.88rem; }
    .type-badge { padding:3px 10px; border-radius:20px; font-size:0.72rem; font-weight:700; display:inline-flex; align-items:center; gap:5px; }
    .type-badge.bike { background:#eff6ff; color:#1d4ed8; }
    .type-badge.car { background:#f0fdf4; color:#15803d; }
    .status-dot { padding:3px 10px; border-radius:20px; font-size:0.72rem; font-weight:700; }
    .status-dot.active { background:#fef9c3; color:#854d0e; }
    .status-dot.done { background:#dcfce7; color:#166534; }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentDate = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  data = signal<any>(null);
  loading = signal(true);
  private refreshSub!: Subscription;

  constructor(private api: AdminApiService) {}

  ngOnInit() {
    this.load();
    // Auto-refresh every 30 seconds
    this.refreshSub = interval(30000).subscribe(() => this.load());
  }

  ngOnDestroy() {
    this.refreshSub?.unsubscribe();
  }

  load() {
    this.loading.set(true);
    this.api.getDashboard().subscribe({
      next: (res) => { this.data.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  getBarHeight(count: number): number {
    const max = Math.max(...(this.data()?.weeklyChart?.map((b: any) => b.count) || [1]), 1);
    return Math.max(4, (count / max) * 100);
  }
}
