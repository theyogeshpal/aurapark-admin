import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

const BASE = 'http://localhost:5000/api/auth';

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private readonly ADMIN_TOKEN = 'aurapark_admin_token';
  private readonly ADMIN_USER = 'aurapark_admin_user';
  private readonly SA_TOKEN = 'aurapark_sa_token';
  private readonly SA_USER = 'aurapark_sa_user';

  adminUser = signal<any>(this.load(this.ADMIN_USER));
  saUser = signal<any>(this.load(this.SA_USER));
  isAdminLoggedIn = signal<boolean>(!!localStorage.getItem(this.ADMIN_TOKEN));
  isSaLoggedIn = signal<boolean>(!!localStorage.getItem(this.SA_TOKEN));

  constructor(private http: HttpClient, private router: Router) {}

  adminLogin(email: string, password: string) {
    return this.http.post<any>(`${BASE}/admin/login`, { email, password }).pipe(
      tap(res => {
        if (res.success) {
          localStorage.setItem(this.ADMIN_TOKEN, res.data.token);
          localStorage.setItem(this.ADMIN_USER, JSON.stringify(res.data.admin));
          this.adminUser.set(res.data.admin);
          this.isAdminLoggedIn.set(true);
        }
      })
    );
  }

  saLogin(email: string, password: string) {
    return this.http.post<any>(`${BASE}/superadmin/login`, { email, password }).pipe(
      tap(res => {
        if (res.success) {
          localStorage.setItem(this.SA_TOKEN, res.data.token);
          localStorage.setItem(this.SA_USER, JSON.stringify(res.data.superadmin));
          this.saUser.set(res.data.superadmin);
          this.isSaLoggedIn.set(true);
        }
      })
    );
  }

  adminLogout() {
    localStorage.removeItem(this.ADMIN_TOKEN); localStorage.removeItem(this.ADMIN_USER);
    this.adminUser.set(null); this.isAdminLoggedIn.set(false);
    this.router.navigate(['/admin/login']);
  }

  saLogout() {
    localStorage.removeItem(this.SA_TOKEN); localStorage.removeItem(this.SA_USER);
    this.saUser.set(null); this.isSaLoggedIn.set(false);
    this.router.navigate(['/superadmin/login']);
  }

  getAdminToken() { return localStorage.getItem(this.ADMIN_TOKEN); }
  getSaToken() { return localStorage.getItem(this.SA_TOKEN); }
  adminHeaders() { return { Authorization: `Bearer ${this.getAdminToken()}` }; }
  saHeaders() { return { Authorization: `Bearer ${this.getSaToken()}` }; }

  private load(key: string) { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; }
}
