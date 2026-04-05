import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AdminAuthService } from './admin-auth.service';

const BASE = 'https://aurapark-backend.onrender.com/api';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  constructor(private http: HttpClient, private auth: AdminAuthService) {}

  private get ah() { return { headers: this.auth.adminHeaders() }; }
  private get sh() { return { headers: this.auth.saHeaders() }; }

  // ── Admin Dashboard ───────────────────────────────────
  getDashboard() { return this.http.get<any>(`${BASE}/admin/dashboard`, this.ah); }

  // ── Admin Parking ─────────────────────────────────────
  getMyParking() { return this.http.get<any>(`${BASE}/parkings/admin/my-parking`, this.ah); }
  updateMyParking(data: any) { return this.http.put<any>(`${BASE}/parkings/admin/my-parking`, data, this.ah); }

  // ── Daily Parking ─────────────────────────────────────
  getPreBookings() { return this.http.get<any>(`${BASE}/daily-parking/prebookings`, this.ah); }
  checkInVehicle(id: string) { return this.http.put<any>(`${BASE}/daily-parking/checkin/${id}`, {}, this.ah); }
  getActiveVehicles() { return this.http.get<any>(`${BASE}/daily-parking/active`, this.ah); }
  getParkingHistory() { return this.http.get<any>(`${BASE}/daily-parking/history`, this.ah); }
  parkVehicle(data: { vehiclenumber: string; ownername: string; type: string }) { return this.http.post<any>(`${BASE}/daily-parking/park`, data, this.ah); }
  exitVehicle(id: string) { return this.http.put<any>(`${BASE}/daily-parking/exit/${id}`, {}, this.ah); }
  completePayment(id: string) { return this.http.put<any>(`${BASE}/daily-parking/payment/${id}`, {}, this.ah); }
  getReceipt(id: string) { return this.http.get<any>(`${BASE}/daily-parking/receipt/${id}`, this.ah); }
  deleteRecord(id: string) { return this.http.delete<any>(`${BASE}/daily-parking/${id}`, this.ah); }

  // ── Change Password ───────────────────────────────────
  changePassword(oldPassword: string, newPassword: string) { return this.http.put<any>(`${BASE}/auth/admin/change-password`, { oldPassword, newPassword }, this.ah); }

  // ── SuperAdmin ────────────────────────────────────────
  getSaDashboard() { return this.http.get<any>(`${BASE}/superadmin/dashboard`, this.sh); }
  getAllParkings() { return this.http.get<any>(`${BASE}/parkings/superadmin/all`, this.sh); }
  getPendingParkings() { return this.http.get<any>(`${BASE}/parkings/superadmin/pending`, this.sh); }
  verifyParking(id: string) { return this.http.put<any>(`${BASE}/parkings/superadmin/${id}/verify`, {}, this.sh); }
  deleteParking(id: string) { return this.http.delete<any>(`${BASE}/parkings/superadmin/${id}`, this.sh); }
  getAllContacts() { return this.http.get<any>(`${BASE}/contact`, this.sh); }
  deleteContact(id: number) { return this.http.delete<any>(`${BASE}/contact/${id}`, this.sh); }

  // ── Notifications ─────────────────────────────────────
  sendNotification(data: any) { return this.http.post<any>(`${BASE}/notifications`, data, this.sh); }
  getAllNotifications() { return this.http.get<any>(`${BASE}/notifications/all`, this.sh); }
  deleteNotification(id: string) { return this.http.delete<any>(`${BASE}/notifications/${id}`, this.sh); }
  getAdminNotifications() { return this.http.get<any>(`${BASE}/notifications/admin`, this.ah); }
  markAdminNotifRead(id: string) { return this.http.put<any>(`${BASE}/notifications/admin/${id}/read`, {}, this.ah); }
  getAllUsers() { return this.http.get<any>(`${BASE}/superadmin/users`, this.sh); }
  addUser(data: any) { return this.http.post<any>(`${BASE}/superadmin/users`, data, this.sh); }
  updateUser(id: string, data: any) { return this.http.put<any>(`${BASE}/superadmin/users/${id}`, data, this.sh); }
  deleteUser(id: string) { return this.http.delete<any>(`${BASE}/superadmin/users/${id}`, this.sh); }

  // ── FAQs ──────────────────────────────────────────────
  getFaqs() { return this.http.get<any>(`${BASE}/faqs/admin`, this.sh); }
  createFaq(data: any) { return this.http.post<any>(`${BASE}/faqs`, data, this.sh); }
  updateFaq(id: string, data: any) { return this.http.put<any>(`${BASE}/faqs/${id}`, data, this.sh); }
  deleteFaq(id: string) { return this.http.delete<any>(`${BASE}/faqs/${id}`, this.sh); }
}
