import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/admin/login', pathMatch: 'full' },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes)
  },
  {
    path: 'superadmin',
    loadChildren: () => import('./superadmin/superadmin.routes').then(m => m.superadminRoutes)
  },
  { path: '**', redirectTo: '/admin/login' }
];
