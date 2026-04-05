import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AdminAuthService } from '../../services/admin-auth.service';

@Component({
  selector: 'app-superadmin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
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
    <div class="me-3">
      <button class="btn btn-light rounded-circle position-relative">
        <i class="fa-solid fa-bell"></i>
        <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="font-size:0.6rem">3</span>
      </button>
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
    @media (max-width:992px) {
      .sidebar { transform:translateX(-100%); }
      .sidebar.show { transform:translateX(0); }
      .sa-header, .sa-main-content, .sa-footer { margin-left:0; }
    }
  `]
})
export class SuperadminLayoutComponent {
  sidebarOpen = false;
  constructor(public auth: AdminAuthService) {}
  toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; }
  closeSidebar() { this.sidebarOpen = false; }
}
