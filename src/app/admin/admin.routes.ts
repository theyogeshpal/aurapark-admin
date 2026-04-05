import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { adminGuard } from '../guards/admin.guard';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'manage-parking', loadComponent: () => import('./manage-parking/manage-parking.component').then(m => m.ManageParkingComponent) },
      { path: 'park-vehicle', loadComponent: () => import('./park-vehicle/park-vehicle.component').then(m => m.ParkVehicleComponent) },
      { path: 'prebookings', loadComponent: () => import('./prebookings/prebookings.component').then(m => m.PrebookingsComponent) },
      { path: 'park-history', loadComponent: () => import('./park-history/park-history.component').then(m => m.ParkHistoryComponent) },
      { path: 'change-password', loadComponent: () => import('./change-password/change-password.component').then(m => m.ChangePasswordComponent) },
    ]
  },
  { path: 'login', loadComponent: () => import('./login/admin-login.component').then(m => m.AdminLoginComponent) }
];
