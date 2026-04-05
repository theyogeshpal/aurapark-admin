import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminAuthService } from '../../services/admin-auth.service';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <aside class="sidebar admin-sidebar" [class.show]="sidebarOpen" id="sidebar">
      <div class="sidebar-logo">
        <img src="https://aurapark-v2.vercel.app/Assets/images/Horizontal-logo-exact-ratio-removebg-preview.png" style="height:61px;object-fit:contain;" alt="AuraPark">
      </div>
      <nav class="nav-list">
        <a class="nav-link-custom" routerLink="/admin/dashboard" routerLinkActive="active" (click)="closeSidebar()">
          <i class='bx bxs-dashboard'></i> <span>Dashboard</span>
        </a>
        <a class="nav-link-custom" routerLink="/admin/manage-parking" routerLinkActive="active" (click)="closeSidebar()">
          <i class='bx bxs-car-garage'></i> <span>Manage Parking</span>
        </a>
        <a class="nav-link-custom" routerLink="/admin/park-vehicle" routerLinkActive="active" (click)="closeSidebar()">
          <i class='bx bxs-parking'></i> <span>Park Vehicle</span>
        </a>
        <a class="nav-link-custom" routerLink="/admin/prebookings" routerLinkActive="active" (click)="closeSidebar()">
          <i class='bx bx-calendar-check'></i> <span>Pre-Bookings</span>
        </a>
        <a class="nav-link-custom" routerLink="/admin/park-history" routerLinkActive="active" (click)="closeSidebar()">
          <i class='bx bx-history'></i> <span>Parking History</span>
        </a>
        <a class="nav-link-custom" href="https://aurapark-v2.vercel.app/" target="_blank">
          <i class='bx bx-globe'></i> <span>View Website</span>
        </a>
        <a class="nav-link-custom text-danger" (click)="auth.adminLogout()" style="cursor:pointer" (click)="closeSidebar()">
          <i class='bx bx-log-out-circle'></i> <span>Logout</span>
        </a>
      </nav>
    </aside>

    <div class="sidebar-overlay" [class.d-block]="sidebarOpen" (click)="closeSidebar()"></div>

    <div class="main-content">
      <header class="top-header">
        <div class="container-fluid d-flex align-items-center justify-content-between p-0">
          <div class="d-flex align-items-center">
            <button class="btn btn-light d-lg-none me-2" (click)="toggleSidebar()">
              <i class='bx bx-menu fs-4'></i>
            </button>
            <div class="search-wrapper d-none d-lg-block">
              <i class='bx bx-search'></i>
              <input type="text" class="search-input" placeholder="Search data...">
            </div>
          </div>
          <div class="header-actions">
            <div class="dropdown d-none d-sm-flex">
              <div class="icon-btn position-relative" data-bs-toggle="dropdown" data-bs-auto-close="outside">
                <i class='bx bx-bell fs-5'></i>
                <span class="badge-dot" *ngIf="unreadCount > 0">{{unreadCount}}</span>
              </div>
              <div class="dropdown-menu dropdown-menu-end notif-dropdown p-0">
                <!-- Header -->
                <div class="notif-header d-flex justify-content-between align-items-center px-3 py-3">
                  <div class="d-flex align-items-center gap-2">
                    <i class='bx bx-bell text-primary fs-5'></i>
                    <span class="fw-bold text-dark">Notifications</span>
                  </div>
                  <span class="badge bg-primary rounded-pill px-2" *ngIf="unreadCount > 0">{{unreadCount}} new</span>
                </div>
                <!-- Empty -->
                <div *ngIf="notifications.length === 0" class="notif-empty">
                  <i class='bx bx-bell-off'></i>
                  <p class="mb-0 mt-2 text-muted small">No notifications yet</p>
                </div>
                <!-- List -->
                <div class="notif-list">
                  <div *ngFor="let n of notifications" class="notif-item" [class.unread]="!n.isRead" (click)="markRead(n._id)">
                    <div class="d-flex gap-3 align-items-start">
                      <div class="notif-icon" [class.notif-icon-unread]="!n.isRead">
                        <i class='bx bx-info-circle'></i>
                      </div>
                      <div class="flex-grow-1 overflow-hidden">
                        <div class="d-flex justify-content-between align-items-center">
                          <span class="notif-title">{{n.title}}</span>
                          <span class="unread-dot" *ngIf="!n.isRead"></span>
                        </div>
                        <p class="notif-msg mb-1">{{n.message}}</p>
                        <span class="notif-time"><i class='bx bx-time-five me-1'></i>{{n.createdAt | date:'dd MMM, hh:mm a'}}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="dropdown">
              <div class="icon-btn" data-bs-toggle="dropdown">
                <i class='bx bx-cog fs-5'></i>
              </div>
              <ul class="dropdown-menu dropdown-menu-end shadow border-0 p-2 mt-2">
                <li><a class="dropdown-item rounded-2 small" routerLink="/admin/change-password">Change Password</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item rounded-2 small text-danger" (click)="auth.adminLogout()" style="cursor:pointer"><i class='bx bx-log-out-circle me-1'></i> Logout</a></li>
              </ul>
            </div>
            <div class="user-profile">
              <div class="text-end d-none d-md-block">
                <p class="mb-0 fw-bold small text-dark">Admin User</p>
                <p class="mb-0 text-muted" style="font-size:0.7rem">System Admin</p>
              </div>
              <img src="https://static.vecteezy.com/system/resources/previews/000/439/863/original/vector-users-icon.jpg" class="user-avatar" alt="User">
            </div>
          </div>
        </div>
      </header>

      <main class="container-fluid p-3 p-md-4 flex-grow-1">
        <router-outlet />
      </main>

      <footer class="admin-footer">
        <div class="container-fluid d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
          <div>&copy; 2026 <span class="fw-bold text-primary">Aura Park</span>. Intelligence for space.</div>
          <div class="small">Crafted with <i class='bx bxs-heart text-danger'></i> by <a href="https://yogesh-pal.netlify.app/" target="_blank" class="text-primary fw-semibold text-decoration-none">Yogesh Pal</a></div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .admin-sidebar {
      background: #ffffff;
      border-right: 1px solid #eef0f2;
    }
    .sidebar-logo {
      padding: 25px 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-bottom: 1px solid #eef0f2;
    }
    .nav-list {
      padding: 15px;
      list-style: none;
    }
    .nav-link-custom {
      display: flex;
      align-items: center;
      padding: 12px 15px;
      margin-bottom: 5px;
      border-radius: 12px;
      color: #64748b;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s;
    }
    .nav-link-custom i { font-size: 20px; margin-right: 12px; }
    .nav-link-custom:hover { background-color: #f1f5f9; color: #0d6efd; }
    .nav-link-custom.active { background-color: #0d6efd; color: white !important; box-shadow: 0 4px 12px rgba(13,110,253,0.25); }
    .search-wrapper { position: relative; max-width: 350px; width: 100%; }
    .search-wrapper i { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
    .search-input { padding: 10px 15px 10px 45px; border-radius: 10px; border: 1px solid #e2e8f0; width: 100%; font-size: 0.85rem; }
    .header-actions { display: flex; align-items: center; gap: 12px; }
    .icon-btn { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: white; border: 1px solid #e2e8f0; color: #64748b; position: relative; cursor: pointer; }
    .badge-dot { position: absolute; top: 4px; right: 4px; min-width: 16px; height: 16px; background: #ef4444; border: 2px solid white; border-radius: 50%; font-size: 0.6rem; color: white; display: flex; align-items: center; justify-content: center; padding: 0 2px; }
    .notif-dropdown { width: 360px; border-radius: 16px !important; box-shadow: 0 10px 40px rgba(0,0,0,0.12) !important; border: 1px solid #f1f5f9 !important; overflow: hidden; margin-top: 8px !important; }
    .notif-header { background: #f8fafc; border-bottom: 1px solid #f1f5f9; }
    .notif-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; color: #94a3b8; }
    .notif-empty i { font-size: 2.5rem; }
    .notif-list { max-height: 360px; overflow-y: auto; padding: 8px; }
    .notif-list::-webkit-scrollbar { width: 4px; }
    .notif-list::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
    .notif-item { padding: 12px; border-radius: 12px; cursor: pointer; margin-bottom: 4px; transition: all 0.2s; border: 1px solid transparent; }
    .notif-item:hover { background: #f8faff; border-color: #e2e8f0; }
    .notif-item.unread { background: #eff6ff; border-color: #bfdbfe; }
    .notif-icon { width: 36px; height: 36px; border-radius: 10px; background: #f1f5f9; color: #64748b; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; }
    .notif-icon-unread { background: #dbeafe; color: #2563eb; }
    .notif-title { font-weight: 700; font-size: 0.85rem; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; display: block; }
    .notif-msg { font-size: 0.78rem; color: #64748b; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .notif-time { font-size: 0.7rem; color: #94a3b8; display: flex; align-items: center; }
    .unread-dot { width: 8px; height: 8px; background: #3b82f6; border-radius: 50%; flex-shrink: 0; margin-left: 6px; }
    .user-profile { display: flex; align-items: center; gap: 10px; padding-left: 15px; border-left: 1px solid #e2e8f0; }
    .user-avatar { width: 38px; height: 38px; border-radius: 10px; object-fit: cover; }
    .sidebar-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1040; }
  `]
})
export class AdminLayoutComponent implements OnInit {
  sidebarOpen = false;
  notifications: any[] = [];
  unreadCount = 0;

  constructor(public auth: AdminAuthService, private api: AdminApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.api.getAdminNotifications().subscribe({
      next: (res) => {
        this.notifications = res.data || [];
        this.unreadCount = this.notifications.filter((n: any) => !n.isRead).length;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Notification fetch failed:', err)
    });
  }

  markRead(id: string) {
    this.api.markAdminNotifRead(id).subscribe();
    this.notifications = this.notifications.map(n => n._id === id ? { ...n, isRead: true } : n);
    this.unreadCount = this.notifications.filter(n => !n.isRead).length;
  }

  toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; }
  closeSidebar() { this.sidebarOpen = false; }
}
