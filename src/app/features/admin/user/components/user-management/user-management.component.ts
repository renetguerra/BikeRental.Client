import { AfterViewInit, Component, effect, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { User } from 'src/app/core/_models/user';
import { AdminService } from 'src/app/core/_services/admin.service';
import { AdminUserStore } from 'src/app/core/_stores/adminUser.store';
import { RolesModalComponent } from 'src/app/shared/components/modals/roles-modal/roles-modal.component';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-user-management',
  standalone: true,
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    TranslocoModule
  ]
})
export class UserManagementComponent implements OnInit, AfterViewInit {

  private adminUserStore = inject(AdminUserStore);
  private adminService = inject(AdminService);
  private modalService = inject(BsModalService);

  users = this.adminUserStore.users;

  displayedColumns: string[] = ['username', 'roles', 'actions'];
  bsModalRef: BsModalRef<RolesModalComponent> = new BsModalRef<RolesModalComponent>();
  availableRoles = ['Admin','Moderator','Member'];

  dataSource = new MatTableDataSource<User>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor() {
    // Effect para sincronizar el signal users con el dataSource
    effect(() => {
      const users = this.users();
      this.dataSource.data = users;
    });
  }

  ngOnInit(): void {
    this.getUsersWithRoles();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  getUsersWithRoles() {
    this.adminService.getUsersWithRoles().subscribe({
      next: users => {
        console.log('Users received from service:', users);
        this.adminUserStore.setUsers(users);
      },
      error: error => {
        console.error('Error loading users:', error);
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
