import { Component, inject, OnInit } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { User } from 'src/app/core/_models/user';
import { AdminService } from 'src/app/core/_services/admin.service';
import { AdminUserStore } from 'src/app/core/_stores/adminUser.store';
import { RolesModalComponent } from 'src/app/shared/components/modals/roles-modal/roles-modal.component';


@Component({
    selector: 'app-user-management',
    templateUrl: './user-management.component.html',
    styleUrls: ['./user-management.component.css'],
    imports: [MatSlideToggleModule]
})
export class UserManagementComponent implements OnInit { 
  
  private adminUserStore = inject(AdminUserStore);
  private adminService = inject(AdminService);
  private modalService = inject(BsModalService);
  
  users = this.adminUserStore.users;
  bsModalRef: BsModalRef<RolesModalComponent> = new BsModalRef<RolesModalComponent>();
  availableRoles = ['Admin','Moderator','Member'];
   
  canSendMessages = this.adminUserStore.canSendMessages;

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

  private arrayEqual(arr1: any, arr2: any) {
    return JSON.stringify(arr1.sort()) === JSON.stringify(arr2.sort())
  }

  allowSendMessages(user: User) {    
    const currentState = this.canSendMessages()[user.username];    
    const newState = !currentState;
    this.adminUserStore.toggleSendMessagesPermission(user.username);
    this.adminUserStore.updateUserCanSendMessages(user.username, newState);    
  }
}