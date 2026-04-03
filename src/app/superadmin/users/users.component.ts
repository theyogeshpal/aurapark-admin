import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../services/admin-api.service';

interface User {
  _id: string; name: string; email: string;
  mobile: string; city: string; role: string;
  avatar: string | null; createdAt: string;
}

@Component({
  selector: 'app-users',
  imports: [CommonModule, FormsModule],
  template: `
<div class="container-fluid py-4">

  <!-- Header -->
  <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
    <div>
      <h1 class="h3 fw-bold mb-1">All Users</h1>
      <p class="text-muted small mb-0">Total <strong>{{filtered().length}}</strong> users registered</p>
    </div>
    <div class="d-flex gap-2">
      <div class="search-box">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input type="text" [(ngModel)]="searchQ" (input)="onSearch()" placeholder="Search by name or email...">
      </div>
      <button class="btn btn-primary btn-sm px-3" (click)="openAddModal()">
        <i class="fa-solid fa-user-plus me-1"></i> Add User
      </button>
    </div>
  </div>

  <!-- Loading -->
  <div *ngIf="loading()" class="text-center py-5"><div class="spinner-border text-primary"></div></div>

  <!-- Table -->
  <div class="main-card" *ngIf="!loading()">
    <div class="table-responsive">
      <table class="table align-middle mb-0">
        <thead>
          <tr>
            <th style="width:5%">#</th>
            <th style="width:30%">User</th>
            <th style="width:20%">Contact</th>
            <th style="width:15%">City</th>
            <th style="width:15%">Joined</th>
            <th style="width:10%">Role</th>
            <th class="text-center" style="width:10%">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let user of filtered(); let i = index">
            <td class="text-muted small fw-bold">{{i+1}}</td>
            <td>
              <div class="d-flex align-items-center gap-3">
                <div class="user-initial">{{user.name.charAt(0).toUpperCase()}}</div>
                <div>
                  <div class="fw-bold text-dark">{{user.name}}</div>
                  <div class="text-muted small">{{user.email}}</div>
                </div>
              </div>
            </td>
            <td>
              <div class="small">
                <div><i class="fa-solid fa-phone text-muted me-1"></i>{{user.mobile || '—'}}</div>
              </div>
            </td>
            <td><span class="text-muted small">{{user.city || '—'}}</span></td>
            <td><span class="text-muted small">{{user.createdAt | date:'dd MMM yyyy'}}</span></td>
            <td>
              <span class="role-badge" [class.role-admin]="user.role==='admin'" [class.role-user]="user.role==='user'">
                {{user.role}}
              </span>
            </td>
            <td class="text-center">
              <div class="d-flex justify-content-center gap-1">
                <button class="btn-icon btn-edit" (click)="openEditModal(user)" title="Edit">
                  <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn-icon btn-del" (click)="deleteUser(user._id, user.name)" title="Delete">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
          <tr *ngIf="filtered().length === 0">
            <td colspan="7" class="text-center py-5 text-muted">
              <i class="fa-solid fa-users-slash d-block fs-2 mb-2"></i>No users found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

<!-- Edit / Add Modal -->
<div class="modal-overlay" [class.open]="modalOpen()" (click)="closeModal()">
  <div class="modal-box" (click)="$event.stopPropagation()">
    <div class="modal-header-custom">
      <h6 class="mb-0 fw-bold">{{editMode() ? 'Edit User' : 'Add New User'}}</h6>
      <button class="close-btn" (click)="closeModal()"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <div class="modal-body-custom">
      <div *ngIf="modalError()" class="alert alert-danger py-2 small border-0 rounded-3 mb-3">
        <i class="fa-solid fa-circle-exclamation me-2"></i>{{modalError()}}
      </div>
      <div class="row g-3">
        <div class="col-12">
          <label class="field-label">Full Name <span class="text-danger">*</span></label>
          <input type="text" class="field-input" [(ngModel)]="form.name" placeholder="John Doe">
        </div>
        <div class="col-12">
          <label class="field-label">Email <span class="text-danger">*</span></label>
          <input type="email" class="field-input" [(ngModel)]="form.email" placeholder="john@example.com">
        </div>
        <div class="col-md-6">
          <label class="field-label">Mobile</label>
          <input type="tel" class="field-input" [(ngModel)]="form.mobile" placeholder="9876543210">
        </div>
        <div class="col-md-6">
          <label class="field-label">City</label>
          <input type="text" class="field-input" [(ngModel)]="form.city" placeholder="Delhi">
        </div>
        <div class="col-12" *ngIf="!editMode()">
          <label class="field-label">Password <span class="text-danger">*</span></label>
          <input type="password" class="field-input" [(ngModel)]="form.password" placeholder="Min 6 characters">
        </div>
      </div>
    </div>
    <div class="modal-footer-custom">
      <button class="btn-cancel" (click)="closeModal()">Cancel</button>
      <button class="btn-save" (click)="saveUser()" [disabled]="saving()">
        <span *ngIf="!saving()"><i class="fa-solid fa-check me-1"></i>{{editMode() ? 'Save Changes' : 'Add User'}}</span>
        <span *ngIf="saving()"><i class="fa-solid fa-spinner fa-spin me-1"></i>Saving...</span>
      </button>
    </div>
  </div>
</div>

<!-- View Modal -->
<div class="modal-overlay" [class.open]="viewModalOpen()" (click)="viewModalOpen.set(false)">
  <div class="modal-box" (click)="$event.stopPropagation()" *ngIf="selectedUser()">
    <div class="modal-header-custom">
      <h6 class="mb-0 fw-bold">User Details</h6>
      <button class="close-btn" (click)="viewModalOpen.set(false)"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <div class="modal-body-custom text-center">
      <div class="user-initial-lg mx-auto mb-3">{{selectedUser()!.name.charAt(0).toUpperCase()}}</div>
      <h5 class="fw-bold mb-1">{{selectedUser()!.name}}</h5>
      <p class="text-muted small mb-3">{{selectedUser()!.email}}</p>
      <div class="info-row-view"><span>Mobile</span><span>{{selectedUser()!.mobile || '—'}}</span></div>
      <div class="info-row-view"><span>City</span><span>{{selectedUser()!.city || '—'}}</span></div>
      <div class="info-row-view"><span>Role</span><span class="role-badge role-user">{{selectedUser()!.role}}</span></div>
      <div class="info-row-view"><span>Joined</span><span>{{selectedUser()!.createdAt | date:'dd MMM yyyy'}}</span></div>
    </div>
  </div>
</div>
  `,
  styles: [`
    .main-card { background:white; border-radius:16px; box-shadow:0 4px 20px rgba(0,0,0,0.05); overflow:hidden; }
    .table thead th { background:#f8fafc; color:#64748b; font-size:0.78rem; text-transform:uppercase; letter-spacing:0.5px; font-weight:700; padding:14px 16px; border:none; }
    .table tbody td { padding:14px 16px; vertical-align:middle; border-bottom:1px solid #f1f5f9; }
    .table tbody tr:hover { background:#f8fbff; }
    .table tbody tr:last-child td { border-bottom:none; }

    .search-box { display:flex; align-items:center; background:white; border:1.5px solid #e2e8f0; border-radius:10px; padding:0 14px; gap:10px; }
    .search-box i { color:#94a3b8; font-size:0.85rem; }
    .search-box input { border:none; outline:none; padding:9px 0; font-size:0.9rem; width:220px; color:#1e293b; background:transparent; }

    .user-initial { width:40px; height:40px; border-radius:12px; background:linear-gradient(135deg,#556ee6,#6f42c1); color:white; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:1rem; flex-shrink:0; }
    .user-initial-lg { width:72px; height:72px; border-radius:20px; background:linear-gradient(135deg,#556ee6,#6f42c1); color:white; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:1.8rem; }

    .role-badge { padding:4px 12px; border-radius:50px; font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; }
    .role-user { background:#eff6ff; color:#1d4ed8; }
    .role-admin { background:#fef3c7; color:#92400e; }

    .btn-icon { width:34px; height:34px; border:none; border-radius:8px; display:inline-flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.2s; font-size:0.85rem; }
    .btn-edit { background:#eff6ff; color:#1d4ed8; }
    .btn-edit:hover { background:#dbeafe; }
    .btn-del { background:#fff1f2; color:#e11d48; }
    .btn-del:hover { background:#ffe4e6; }

    /* Modal */
    .modal-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); backdrop-filter:blur(4px); z-index:2000; align-items:center; justify-content:center; padding:16px; }
    .modal-overlay.open { display:flex; }
    .modal-box { background:white; border-radius:20px; width:100%; max-width:480px; box-shadow:0 20px 60px rgba(0,0,0,0.2); overflow:hidden; }
    .modal-header-custom { display:flex; align-items:center; justify-content:space-between; padding:20px 24px; border-bottom:1px solid #f1f5f9; }
    .close-btn { width:32px; height:32px; border:none; background:#f1f5f9; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#64748b; }
    .close-btn:hover { background:#e2e8f0; }
    .modal-body-custom { padding:24px; }
    .modal-footer-custom { display:flex; gap:12px; padding:16px 24px; border-top:1px solid #f1f5f9; }
    .field-label { font-size:0.78rem; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:6px; }
    .field-input { width:100%; padding:11px 14px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:0.9rem; color:#1e293b; outline:none; transition:border-color 0.2s; }
    .field-input:focus { border-color:#556ee6; }
    .btn-cancel { flex:1; padding:11px; border:1.5px solid #e2e8f0; border-radius:10px; background:white; color:#64748b; font-weight:600; cursor:pointer; }
    .btn-cancel:hover { background:#f8fafc; }
    .btn-save { flex:2; padding:11px; border:none; border-radius:10px; background:#556ee6; color:white; font-weight:700; cursor:pointer; transition:background 0.2s; }
    .btn-save:hover:not(:disabled) { background:#4558c8; }
    .btn-save:disabled { opacity:0.7; cursor:not-allowed; }

    .info-row-view { display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #f1f5f9; font-size:0.9rem; }
    .info-row-view:last-child { border-bottom:none; }
    .info-row-view span:first-child { color:#94a3b8; font-weight:600; font-size:0.8rem; text-transform:uppercase; }
  `]
})
export class UsersComponent implements OnInit {
  users = signal<User[]>([]);
  filtered = signal<User[]>([]);
  loading = signal(true);
  saving = signal(false);
  searchQ = '';

  modalOpen = signal(false);
  viewModalOpen = signal(false);
  editMode = signal(false);
  selectedUser = signal<User | null>(null);
  modalError = signal('');

  form: Partial<User & { password: string }> = { name: '', email: '', mobile: '', city: '', password: '' };
  private editingId = '';

  constructor(private api: AdminApiService) {}

  ngOnInit() { this.loadUsers(); }

  loadUsers() {
    this.loading.set(true);
    this.api.getAllUsers().subscribe({
      next: (res) => { this.users.set(res.data || []); this.filtered.set(res.data || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onSearch() {
    const q = this.searchQ.toLowerCase();
    if (!q) { this.filtered.set(this.users()); return; }
    this.filtered.set(this.users().filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.city || '').toLowerCase().includes(q)));
  }

  openAddModal() {
    this.editMode.set(false);
    this.form = { name: '', email: '', mobile: '', city: '', password: '' };
    this.modalError.set('');
    this.editingId = '';
    this.modalOpen.set(true);
  }

  openEditModal(user: User) {
    this.editMode.set(true);
    this.form = { name: user.name, email: user.email, mobile: user.mobile, city: user.city };
    this.modalError.set('');
    this.editingId = user._id;
    this.modalOpen.set(true);
  }

  closeModal() { this.modalOpen.set(false); }

  saveUser() {
    if (!this.form.name || !this.form.email) { this.modalError.set('Name and email are required'); return; }
    if (!this.editMode() && !this.form.password) { this.modalError.set('Password is required'); return; }
    this.saving.set(true);
    this.modalError.set('');

    if (this.editMode()) {
      this.api.updateUser(this.editingId, this.form).subscribe({
        next: (res) => {
          this.users.update(u => u.map(x => x._id === this.editingId ? res.data : x));
          this.filtered.update(u => u.map(x => x._id === this.editingId ? res.data : x));
          this.saving.set(false); this.closeModal();
          (window as any).Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'User updated!', showConfirmButton: false, timer: 2500 });
        },
        error: (err) => { this.modalError.set(err.error?.message || 'Update failed'); this.saving.set(false); }
      });
    } else {
      this.api.addUser(this.form).subscribe({
        next: (res) => {
          this.users.update(u => [res.data, ...u]);
          this.filtered.update(u => [res.data, ...u]);
          this.saving.set(false); this.closeModal();
          (window as any).Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'User added!', showConfirmButton: false, timer: 2500 });
        },
        error: (err) => { this.modalError.set(err.error?.message || 'Failed to add user'); this.saving.set(false); }
      });
    }
  }

  deleteUser(id: string, name: string) {
    (window as any).Swal.fire({ title: `Delete "${name}"?`, text: 'This cannot be undone.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#e11d48', confirmButtonText: 'Yes, Delete' }).then((r: any) => {
      if (!r.isConfirmed) return;
      this.api.deleteUser(id).subscribe({
        next: () => {
          this.users.update(u => u.filter(x => x._id !== id));
          this.filtered.update(u => u.filter(x => x._id !== id));
          (window as any).Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'User deleted', showConfirmButton: false, timer: 2500 });
        },
        error: (err) => (window as any).Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: err.error?.message || 'Delete failed', showConfirmButton: false, timer: 3000 })
      });
    });
  }
}
