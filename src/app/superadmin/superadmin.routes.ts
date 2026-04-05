import { Routes } from '@angular/router';
import { SuperadminLayoutComponent } from './superadmin-layout/superadmin-layout.component';
import { saGuard } from '../guards/admin.guard';

export const superadminRoutes: Routes = [
  {
    path: '',
    component: SuperadminLayoutComponent,
    canActivate: [saGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./dashboard/sa-dashboard.component').then(m => m.SaDashboardComponent) },
      { path: 'parkings', loadComponent: () => import('./parkings/parkings.component').then(m => m.ParkingsComponent) },
      { path: 'review-parking', loadComponent: () => import('./review-parking/review-parking.component').then(m => m.ReviewParkingComponent) },
      { path: 'contact-form', loadComponent: () => import('./contact-form/contact-form.component').then(m => m.ContactFormComponent) },
      { path: 'users', loadComponent: () => import('./users/users.component').then(m => m.UsersComponent) },
      { path: 'notifications', loadComponent: () => import('./notifications/notifications.component').then(m => m.NotificationsComponent) },
      { path: 'faqs', loadComponent: () => import('./faqs/faqs.component').then(m => m.FaqsComponent) },
    ]
  },
  { path: 'login', loadComponent: () => import('./login/sa-login.component').then(m => m.SaLoginComponent) }
];
