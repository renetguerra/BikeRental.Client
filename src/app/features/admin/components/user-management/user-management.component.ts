import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { User } from 'src/app/core/_models/user';
import { AdminService } from 'src/app/core/_services/admin.service';
import { AdminUserStore } from 'src/app/core/_stores/adminUser.store';
import { RolesModalComponent } from 'src/app/shared/components/modals/roles-modal/roles-modal.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule
  ]
})
export class UserManagementComponent implements OnInit {

  private adminUserStore = inject(AdminUserStore);
  private adminService = inject(AdminService);
  private modalService = inject(BsModalService);

  users = this.adminUserStore.users;
  displayedColumns: string[] = ['username', 'roles', 'actions'];
  bsModalRef: BsModalRef<RolesModalComponent> = new BsModalRef<RolesModalComponent>();
  availableRoles = ['Admin','Moderator','Member'];

  ngOnInit(): void {
    this.getUsersWithRoles();
  }

  getUsersWithRoles() {
    this.adminService.getUsersWithRoles().subscribe({
      next: users => {
        this.adminUserStore.setUsers(users);
      }
    });
  }

  openRolesModal(user: User) {
    const config = {
      class: 'modal-dialog-centered',
      initialState: {
        username: user.username,
        availableRoles: this.availableRoles,
        selectedRoles: [...user.roles]
      }
    }
    this.bsModalRef = this.modalService.show(RolesModalComponent, config);
    this.bsModalRef.onHide?.subscribe(() => {
      const selectedRoles = this.bsModalRef.content?.selectedRoles;
      if (selectedRoles && !this.arrayEqual(selectedRoles, user.roles)) {
        this.adminUserStore.updateUserRoles(user.username, selectedRoles);
        this.adminService.updateUserRoles(user.username, selectedRoles).subscribe();
      }
    });
  }

  private arrayEqual(arr1: string[], arr2: string[]): boolean {
    return JSON.stringify(arr1.sort()) === JSON.stringify(arr2.sort())
  }
}
