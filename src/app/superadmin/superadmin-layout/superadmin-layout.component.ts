import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AdminAuthService } from '../../services/admin-auth.service';
import { AdminApiService } from '../../services/admin-api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-superadmin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
<nav class="sidebar sa-sidebar shadow" [class.show]="sidebarOpen" id="sidebar">
  <div class="sidebar-brand">
    <img src="https://aurapark-v2.vercel.app/Assets/images/Horizontal-logo-exact-ratio-removebg-preview.png" style="height:61px;object-fit:contain;filter:brightness(0) invert(1);" alt="AuraPark">
  </div>
  <div class="mt-4">
    <small class="text-uppercase px-4 text-warning fw-bold" style="font-size:0.7rem">Main Menu</small>
    <ul class="nav flex-column mt-2">
      <li class="nav-item">
        <a class="nav-link" routerLink="/superadmin/dashboard" routerLinkActive="active" (click)="closeSidebar()">
          <i class="fa-solid fa-chart-line me-2"></i> Dashboard
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" routerLink="/superadmin/parkings" routerLinkActive="active" (click)="closeSidebar()">
          <i class="fa-solid fa-square-parking me-2"></i> All Parkings
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" routerLink="/superadmin/review-parking" routerLinkActive="active" (click)="closeSidebar()">
          <i class="fa-solid fa-clock-rotate-left me-2"></i> Anonymous Spots
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" routerLink="/superadmin/contact-form" routerLinkActive="active" (click)="closeSidebar()">
          <i class="fa-solid fa-envelope-open-text me-2"></i> User Queries
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" routerLink="/superadmin/users" routerLinkActive="active" (click)="closeSidebar()">
          <i class="fa-solid fa-users me-2"></i> All Users
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" routerLink="/superadmin/notifications" routerLinkActive="active" (click)="closeSidebar()">
          <i class="fa-solid fa-bell me-2"></i> Send Notification
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" routerLink="/superadmin/faqs" routerLinkActive="active" (click)="closeSidebar()">
          <i class="fa-solid fa-circle-question me-2"></i> Manage FAQs
        </a>
      </li>
    </ul>
    <small class="text-uppercase px-4 text-warning fw-bold mt-4 d-block" style="font-size:0.7rem">Account</small>
    <ul class="nav flex-column mt-2">
      <li class="nav-item">
        <a class="nav-link text-danger" (click)="auth.saLogout()" style="cursor:pointer">
          <i class="fa-solid fa-right-from-bracket me-2"></i> Logout
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="https://aurapark-v2.vercel.app/" target="_blank">
          <i class="fa-solid fa-globe me-2"></i> View Website
        </a>
      </li>
    </ul>
  </div>
</nav>

<header class="top-header sa-header">
  <button class="btn d-lg-none me-3" (click)="toggleSidebar()">
    <i class="fa-solid fa-bars fs-4"></i>
  </button>
  <div class="search-bar d-none d-md-flex align-items-center flex-grow-1">
    <i class="fa-solid fa-magnifying-glass ms-3 text-muted"></i>
    <input type="text" class="form-control border-0 bg-transparent" placeholder="Search for data, parkings or users...">
  </div>
  <div class="ms-auto d-flex align-items-center">
    <div class="me-3 dropdown">
      <button class="btn btn-light rounded-circle position-relative" data-bs-toggle="dropdown" data-bs-auto-close="outside">
        <i class="fa-solid fa-bell"></i>
        <span *ngIf="unreadCount > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="font-size:0.6rem">{{unreadCount}}</span>
      </button>
      <div class="dropdown-menu dropdown-menu-end sa-notif-dropdown p-0">
        <div class="sa-notif-header d-flex justify-content-between align-items-center px-3 py-3">
          <span class="fw-bold text-dark">Notifications</span>
          <div class="d-flex align-items-center gap-2">
            <span class="badge bg-primary rounded-pill" *ngIf="unreadCount > 0">{{unreadCount}} new</span>
            <button class="btn btn-link btn-sm p-0 text-muted" style="font-size:0.75rem" (click)="markAllRead()" *ngIf="unreadCount > 0">Mark all read</button>
          </div>
        </div>
        <div class="sa-notif-empty" *ngIf="notifications.length === 0">
          <i class="fa-solid fa-bell-slash fs-2 text-muted d-block mb-2"></i>
          <span class="text-muted small">No notifications yet</span>
        </div>
        <div class="sa-notif-list">
          <div *ngFor="let n of notifications" class="sa-notif-item" [class.unread]="!n.isRead" (click)="markRead(n._id)">
            <div class="sa-notif-icon" [class.unread-icon]="!n.isRead"><i class="fa-solid fa-user-plus"></i></div>
            <div class="flex-grow-1 overflow-hidden">
              <div class="d-flex justify-content-between align-items-center">
                <span class="sa-notif-title">{{n.title}}</span>
                <span class="unread-dot" *ngIf="!n.isRead"></span>
              </div>
              <p class="sa-notif-msg mb-1">{{n.message}}</p>
              <span class="sa-notif-time">{{n.createdAt | date:'dd MMM, hh:mm a'}}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="d-flex align-items-center">
      <div class="text-end me-2 d-none d-sm-block">
        <p class="m-0 fw-bold small text-dark">Super Admin</p>
        <p class="m-0 text-muted small" style="font-size:0.75rem">Super Admin</p>
      </div>
      <img src="https://static.vecteezy.com/system/resources/previews/000/439/863/original/vector-users-icon.jpg" class="rounded-circle" style="width:38px;height:38px;object-fit:cover;border:2px solid #4e73df" alt="User">
    </div>
  </div>
</header>

<main class="sa-main-content">
  <router-outlet />
</main>

<footer class="sa-footer d-flex flex-wrap justify-content-between align-items-center">
  <div class="text-muted">&copy; 2026 <strong>Aura Park</strong>. All Rights Reserved.</div>
  <div class="text-muted small">Built with <i class="fa-solid fa-heart text-danger"></i> by <a href="https://yogesh-pal.netlify.app/" target="_blank" class="text-primary fw-semibold text-decoration-none">Yogesh Pal</a></div>
</footer>
  `,
  styles: [`
    .sa-sidebar { background: #1a1c23; color: #fff; }
    .sidebar-brand { padding: 1.5rem; display:flex; align-items:center; background:#111317; }
    .nav-link { color:#a0aec0; padding:0.8rem 1.5rem; display:flex; align-items:center; transition:0.3s; border-left:4px solid transparent; font-weight:500; }
    .nav-link i { width:25px; font-size:1.1rem; }
    .nav-link:hover, .nav-link.active { color:#fff; background:rgba(255,255,255,0.05); border-left-color:#4e73df; }
    .sa-header { margin-left:var(--sidebar-width); height:70px; background:white; display:flex; align-items:center; padding:0 2rem; box-shadow:0 1px 10px rgba(0,0,0,0.05); position:fixed; top:0; right:0; left:0; z-index:999; }
    .sa-main-content { margin-left:var(--sidebar-width); padding:90px 2rem 60px 2rem; min-height:100vh; background:#f8f9fc; }
    .sa-footer { margin-left:var(--sidebar-width); background:white; padding:1rem 2rem; border-top:1px solid #e3e6f0; font-size:0.9rem; }
    .search-bar { max-width:400px; background:#f1f3f9; border-radius:10px; }
    .sa-notif-dropdown { width:340px; border-radius:14px !important; box-shadow:0 10px 40px rgba(0,0,0,0.12) !important; border:1px solid #f1f5f9 !important; overflow:hidden; margin-top:8px !important; }
    .sa-notif-header { background:#f8fafc; border-bottom:1px solid #f1f5f9; }
    .sa-notif-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:32px 20px; }
    .sa-notif-list { max-height:320px; overflow-y:auto; padding:8px; }
    .sa-notif-item { display:flex; gap:12px; align-items:flex-start; padding:10px; border-radius:10px; cursor:pointer; margin-bottom:4px; transition:all 0.2s; border:1px solid transparent; }
    .sa-notif-item:hover { background:#f8faff; border-color:#e2e8f0; }
    .sa-notif-item.unread { background:#eff6ff; border-color:#bfdbfe; }
    .sa-notif-icon { width:34px; height:34px; border-radius:10px; background:#f1f5f9; color:#64748b; display:flex; align-items:center; justify-content:center; font-size:0.9rem; flex-shrink:0; }
    .sa-notif-icon.unread-icon { background:#dbeafe; color:#2563eb; }
    .sa-notif-title { font-weight:700; font-size:0.82rem; color:#1e293b; }
    .sa-notif-msg { font-size:0.75rem; color:#64748b; line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
    .sa-notif-time { font-size:0.68rem; color:#94a3b8; }
    .unread-dot { width:8px; height:8px; background:#3b82f6; border-radius:50%; flex-shrink:0; }
    @media (max-width:992px) {
      .sidebar { transform:translateX(-100%); }
      .sidebar.show { transform:translateX(0); }
      .sa-header, .sa-main-content, .sa-footer { margin-left:0; }
    }
  `]
})
export class SuperadminLayoutComponent implements OnInit {
  sidebarOpen = false;
  notifications: any[] = [];
  unreadCount = 0;

  constructor(public auth: AdminAuthService, private api: AdminApiService) {}

  ngOnInit() {
    this.api.getSaNotifications().subscribe({
      next: (res) => {
        this.notifications = res.data || [];
        this.unreadCount = this.notifications.filter((n: any) => !n.isRead).length;
      },
      error: () => {}
    });
  }

  markRead(id: string) {
    this.api.markSaNotifRead(id).subscribe();
    this.notifications = this.notifications.map(n => n._id === id ? { ...n, isRead: true } : n);
    this.unreadCount = this.notifications.filter(n => !n.isRead).length;
  }

  markAllRead() {
    this.api.markAllSaNotifRead().subscribe();
    this.notifications = this.notifications.map(n => ({ ...n, isRead: true }));
    this.unreadCount = 0;
  }

  toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; }
  closeSidebar() { this.sidebarOpen = false; }
}
