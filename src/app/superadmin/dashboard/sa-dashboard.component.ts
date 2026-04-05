import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminApiService } from '../../services/admin-api.service';
import { AdminAuthService } from '../../services/admin-auth.service';

@Component({
  selector: 'app-sa-dashboard',
  imports: [CommonModule, RouterLink],
  template: `
<div class="dash-wrap">

  <!-- Header -->
  <div class="dash-header mb-4">
    <div>
      <h1 class="dash-title">Super Admin Dashboard</h1>
      <p class="dash-sub mb-0">AuraPark Central &nbsp;·&nbsp; {{currentDate}}</p>
    </div>
    <div class="d-flex gap-2">
      <a routerLink="/superadmin/review-parking" class="btn btn-warning px-3 shadow-sm btn-sm fw-bold">
        <i class="bi bi-clock me-1"></i> Pending ({{data()?.pendingRequests || 0}})
      </a>
      <a routerLink="/superadmin/notifications" class="btn btn-primary px-3 shadow-sm btn-sm">
        <i class="bi bi-bell me-1"></i> Notify
      </a>
    </div>
  </div>

  <div *ngIf="loading()" class="text-center py-5"><div class="spinner-border" style="color:#556ee6"></div></div>

  <ng-container *ngIf="!loading() && data()">

    <!-- Stat Cards -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-xl-3">
        <div class="scard scard-blue">
          <div class="scard-icon"><i class="bi bi-p-square-fill"></i></div>
          <div class="scard-val">{{data()!.totalSpots}}</div>
          <div class="scard-label">Active Parkings</div>
          <div class="scard-badge up"><i class="bi bi-check-circle"></i> Verified</div>
        </div>
      </div>
      <div class="col-6 col-xl-3">
        <div class="scard scard-orange">
          <div class="scard-icon"><i class="bi bi-hourglass-split"></i></div>
          <div class="scard-val">{{data()!.pendingRequests}}</div>
          <div class="scard-label">Pending Requests</div>
          <a routerLink="/superadmin/review-parking" class="scard-badge warn" style="text-decoration:none">
            <i class="bi bi-arrow-right-circle"></i> Review
          </a>
        </div>
      </div>
      <div class="col-6 col-xl-3">
        <div class="scard scard-green">
          <div class="scard-icon"><i class="bi bi-people-fill"></i></div>
          <div class="scard-val">{{data()!.totalUsers}}</div>
          <div class="scard-label">Registered Users</div>
          <a routerLink="/superadmin/users" class="scard-badge up" style="text-decoration:none">
            <i class="bi bi-arrow-right-circle"></i> Manage
          </a>
        </div>
      </div>
      <div class="col-6 col-xl-3">
        <div class="scard scard-purple">
          <div class="scard-icon"><i class="bi bi-currency-rupee"></i></div>
          <div class="scard-val">₹{{data()!.totalRevenue | number}}</div>
          <div class="scard-label">Platform Revenue</div>
          <div class="scard-badge up"><i class="bi bi-graph-up-arrow"></i> All Time</div>
        </div>
      </div>
    </div>

    <div class="row g-4 mb-4">

      <!-- Monthly Chart -->
      <div class="col-lg-8">
        <div class="dash-card h-100">
          <div class="dash-card-header">
            <div>
              <h5 class="mb-0 fw-bold">Monthly Parking Activity</h5>
              <small class="text-muted">Total vehicles parked per month (last 12 months)</small>
            </div>
          </div>
          <div class="chart-area">
            <div class="chart-bars">
              <div *ngFor="let bar of data()!.monthlyChart" class="chart-col">
                <div class="bar-val">{{bar.count}}</div>
                <div class="bar-fill" [style.height.%]="getBarHeight(bar.count)">
                  <div class="bar-inner-sa"></div>
                </div>
                <div class="bar-label">{{bar.month}}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="col-lg-4">
        <div class="dash-card h-100">
          <div class="dash-card-header">
            <h5 class="mb-0 fw-bold">Quick Stats</h5>
          </div>
          <div class="p-4">
            <div class="qstat-row">
              <div class="qstat-icon" style="background:#eff6ff;color:#3b82f6"><i class="bi bi-ticket-perforated-fill"></i></div>
              <div class="flex-grow-1">
                <div class="qstat-label">Total Bookings</div>
                <div class="qstat-val">{{data()!.totalBookings}}</div>
              </div>
            </div>
            <div class="qstat-row">
              <div class="qstat-icon" style="background:#fef9c3;color:#854d0e"><i class="bi bi-envelope-fill"></i></div>
              <div class="flex-grow-1">
                <div class="qstat-label">User Queries</div>
                <div class="qstat-val">{{data()!.totalContacts}}</div>
              </div>
            </div>
            <div class="qstat-row">
              <div class="qstat-icon" style="background:#f0fdf4;color:#16a34a"><i class="bi bi-building-check"></i></div>
              <div class="flex-grow-1">
                <div class="qstat-label">Verified Spots</div>
                <div class="qstat-val">{{data()!.totalSpots}}</div>
              </div>
            </div>
            <div class="qstat-row" style="border:none">
              <div class="qstat-icon" style="background:#f5f3ff;color:#7c3aed"><i class="bi bi-person-check-fill"></i></div>
              <div class="flex-grow-1">
                <div class="qstat-label">Active Users</div>
                <div class="qstat-val">{{data()!.totalUsers}}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4">

      <!-- Pending Parkings -->
      <div class="col-lg-6">
        <div class="dash-card">
          <div class="dash-card-header">
            <div>
              <h5 class="mb-0 fw-bold">Pending Approvals</h5>
              <small class="text-muted">Parking requests awaiting review</small>
            </div>
            <a routerLink="/superadmin/review-parking" class="btn btn-sm btn-outline-warning">View All</a>
          </div>
          <div class="p-3">
            <div *ngFor="let p of data()!.pendingParkings" class="pending-row">
              <div class="pending-icon"><i class="bi bi-p-square text-warning"></i></div>
              <div class="flex-grow-1">
                <div class="fw-bold text-dark" style="font-size:0.9rem">{{p.parkingname}}</div>
                <div class="text-muted" style="font-size:0.78rem">{{p.city}}, {{p.state}} &nbsp;·&nbsp; {{p.ownername}}</div>
              </div>
              <span class="badge bg-warning text-dark" style="font-size:0.7rem">Pending</span>
            </div>
            <div *ngIf="!data()!.pendingParkings?.length" class="text-center text-muted py-3 small">
              <i class="bi bi-check-circle-fill text-success d-block fs-3 mb-2"></i>All caught up!
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Feedback -->
      <div class="col-lg-6">
        <div class="dash-card">
          <div class="dash-card-header">
            <div>
              <h5 class="mb-0 fw-bold">Recent Queries</h5>
              <small class="text-muted">Latest user contact messages</small>
            </div>
            <a routerLink="/superadmin/contact-form" class="btn btn-sm btn-outline-primary">View All</a>
          </div>
          <div class="p-3">
            <div *ngFor="let fb of data()!.recentFeedback" class="feedback-row">
              <div class="fb-avatar">{{fb.name?.charAt(0)?.toUpperCase()}}</div>
              <div class="flex-grow-1 overflow-hidden">
                <div class="fw-bold text-dark" style="font-size:0.88rem">{{fb.name}}</div>
                <div class="text-muted text-truncate" style="font-size:0.78rem">{{fb.message}}</div>
              </div>
              <div class="text-muted" style="font-size:0.7rem;white-space:nowrap">{{fb.createdAt | date:'dd MMM'}}</div>
            </div>
            <div *ngIf="!data()!.recentFeedback?.length" class="text-center text-muted py-3 small">
              No queries yet.
            </div>
          </div>
        </div>
      </div>

    </div>
  </ng-container>
</div>
  `,
  styles: [`
    .dash-wrap { padding:4px 0; }
    .dash-header { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; }
    .dash-title { font-size:1.6rem; font-weight:800; color:#0f172a; margin:0; }
    .dash-sub { color:#94a3b8; font-size:0.85rem; }

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
    .scard-badge.warn { background:#fffbeb; color:#92400e; }

    .dash-card { background:white; border-radius:18px; box-shadow:0 2px 12px rgba(0,0,0,0.06); overflow:hidden; margin-bottom:0; }
    .dash-card-header { display:flex; justify-content:space-between; align-items:center; padding:20px 24px 16px; border-bottom:1px solid #f1f5f9; }

    .chart-area { padding:20px 24px 16px; }
    .chart-bars { display:flex; align-items:flex-end; gap:4px; height:200px; }
    .chart-col { flex:1; display:flex; flex-direction:column; align-items:center; height:100%; justify-content:flex-end; }
    .bar-val { font-size:0.6rem; color:#94a3b8; margin-bottom:3px; font-weight:600; }
    .bar-fill { width:100%; display:flex; align-items:flex-end; min-height:4px; }
    .bar-inner-sa { width:100%; background:linear-gradient(180deg,#556ee6,#34c38f); border-radius:6px 6px 0 0; height:100%; }
    .bar-label { font-size:0.6rem; color:#94a3b8; margin-top:5px; font-weight:700; }

    .qstat-row { display:flex; align-items:center; gap:14px; padding:12px 0; border-bottom:1px solid #f8fafc; }
    .qstat-icon { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1rem; flex-shrink:0; }
    .qstat-label { font-size:0.75rem; color:#94a3b8; font-weight:600; }
    .qstat-val { font-size:1.1rem; font-weight:800; color:#0f172a; }

    .pending-row { display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid #f8fafc; }
    .pending-icon { width:36px; height:36px; background:#fffbeb; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.1rem; flex-shrink:0; }

    .feedback-row { display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid #f8fafc; }
    .fb-avatar { width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,#556ee6,#34c38f); color:white; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:0.9rem; flex-shrink:0; }
  `]
})
export class SaDashboardComponent implements OnInit {
  currentDate = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  data = signal<any>(null);
  loading = signal(true);

  constructor(private api: AdminApiService, public authService: AdminAuthService) {}

  ngOnInit() {
    this.api.getSaDashboard().subscribe({
      next: (res) => { this.data.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  getBarHeight(count: number): number {
    const max = Math.max(...(this.data()?.monthlyChart?.map((b: any) => b.count) || [1]), 1);
    return Math.max(4, (count / max) * 100);
  }
}
