import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminApiService } from '../../services/admin-api.service';
import { AdminAuthService } from '../../services/admin-auth.service';

@Component({
  selector: 'app-sa-dashboard',
  imports: [CommonModule],
  template: `
<div class="container-fluid py-4">
  <div class="row mb-3">
    <div class="col-12"><h4 class="fw-bold text-uppercase" style="font-size:1.1rem;color:#495057">Overview Dashboard</h4></div>
  </div>

  <div *ngIf="loading()" class="text-center py-5"><div class="spinner-border" style="color:#556ee6"></div></div>

  <div class="row" *ngIf="!loading() && data()">
    <div class="col-xl-4">
      <div class="card welcome-card text-white border-0">
        <div class="card-body p-4">
          <h5 class="fw-bold">Welcome Back, {{authService.saUser()?.name}}</h5>
          <p class="text-white-50 small mb-4">AuraPark Central Management</p>
          <div class="d-flex align-items-center">
            <div class="user-avatar shadow-sm bg-warning me-3">{{authService.saUser()?.name?.charAt(0)}}</div>
            <div><h6 class="mb-0 fw-bold">Super Admin</h6><span class="badge bg-success small">Verified Account</span></div>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm">
        <div class="card-body">
          <h5 class="card-title fw-bold mb-4">Recent Feedback</h5>
          <div class="activity-list">
            <div class="activity-item" *ngFor="let fb of data()!.recentFeedback">
              <span class="text-muted small d-block">{{fb.date | date:'dd MMM yyyy'}}</span>
              <p class="mb-0"><strong>{{fb.name}}:</strong> {{fb.message}}</p>
            </div>
            <p *ngIf="data()!.recentFeedback.length === 0" class="text-muted small">No feedback yet.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="col-xl-8">
      <div class="row">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="flex-grow-1"><p class="text-muted small fw-bold text-uppercase mb-1">Total Spots</p><h3 class="fw-bold mb-0">{{data()!.totalSpots}}</h3></div>
                <div class="mini-stat-icon"><i class='bx bxs-car-garage'></i></div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="flex-grow-1"><p class="text-muted small fw-bold text-uppercase mb-1">Pending Requests</p><h3 class="fw-bold mb-0 text-warning">{{data()!.pendingRequests}}</h3></div>
                <div class="mini-stat-icon" style="background:rgba(241,180,76,0.1);color:#f1b44c"><i class='bx bx-time-five'></i></div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="flex-grow-1"><p class="text-muted small fw-bold text-uppercase mb-1">User Queries</p><h3 class="fw-bold mb-0 text-success">{{data()!.totalContacts}}</h3></div>
                <div class="mini-stat-icon" style="background:rgba(52,195,143,0.1);color:#34c38f"><i class='bx bx-help-circle'></i></div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="flex-grow-1"><p class="text-muted small fw-bold text-uppercase mb-1">Total Users</p><h3 class="fw-bold mb-0" style="color:#556ee6">{{data()!.totalUsers}}</h3></div>
                <div class="mini-stat-icon" style="background:rgba(85,110,230,0.1);color:#556ee6"><i class='bx bx-group'></i></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
          <h5 class="mb-0 fw-bold">Parking Analytics (Monthly)</h5>
        </div>
        <div class="card-body">
          <div class="d-flex align-items-end gap-1" style="height:200px">
            <div *ngFor="let bar of data()!.monthlyChart" class="d-flex flex-column align-items-center flex-grow-1">
              <div [style.height.%]="getBarHeight(bar.count)" style="width:100%;border-radius:6px 6px 0 0;min-height:4px;background:linear-gradient(180deg,#556ee6,#34c38f)"></div>
              <small class="text-muted mt-1" style="font-size:0.6rem">{{bar.month}}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
  `,
  styles: [`
    .card { border:none; border-radius:12px; margin-bottom:24px; transition:transform 0.2s,box-shadow 0.2s; box-shadow:0 4px 12px rgba(0,0,0,0.03); }
    .card:hover { transform:translateY(-3px); box-shadow:0 8px 24px rgba(0,0,0,0.08); }
    .welcome-card { background:linear-gradient(135deg,#556ee6 0%,#3452e1 100%) !important; overflow:hidden; position:relative; }
    .welcome-card::after { content:""; position:absolute; width:150px; height:150px; background:rgba(255,255,255,0.1); border-radius:50%; top:-50px; right:-50px; }
    .user-avatar { width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; color:white; }
    .mini-stat-icon { width:48px; height:48px; display:flex; align-items:center; justify-content:center; font-size:24px; border-radius:12px; background:rgba(85,110,230,0.1); color:#556ee6; }
    .activity-list { padding-left:1rem; border-left:2px dashed #e9ecef; margin-left:10px; }
    .activity-item { position:relative; padding-bottom:1.5rem; padding-left:20px; }
    .activity-item::before { content:""; position:absolute; left:-23px; top:3px; width:12px; height:12px; background:#fff; border:2px solid #556ee6; border-radius:50%; }
  `]
})
export class SaDashboardComponent implements OnInit {
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
