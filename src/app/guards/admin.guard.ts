import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AdminAuthService } from '../services/admin-auth.service';

export const adminGuard = () => {
  const auth = inject(AdminAuthService);
  const router = inject(Router);
  if (auth.isAdminLoggedIn()) return true;
  router.navigate(['/admin/login']);
  return false;
};

export const saGuard = () => {
  const auth = inject(AdminAuthService);
  const router = inject(Router);
  if (auth.isSaLoggedIn()) return true;
  router.navigate(['/superadmin/login']);
  return false;
};
