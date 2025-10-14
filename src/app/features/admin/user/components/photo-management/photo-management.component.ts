import { Component, inject, computed } from '@angular/core';
import { Photo } from 'src/app/core/_models/photo';
import { AdminService } from 'src/app/core/_services/admin.service';
import { AdminUserStore } from '../../../../../core/_stores/adminUser.store';
import { MemberStore } from 'src/app/core/_stores/member.store';
import { ToastrService } from 'ngx-toastr';
import { MembersService } from '../../../../../core/_services/members.service';
import { JsonPipe } from '@angular/common';
import { CommonTableComponent } from 'src/app/shared/components/table/common/common-table.component';
import { Member } from 'src/app/core/_models/member';
import { P } from '@angular/cdk/platform.d-B3vREl3q';

@Component({
    selector: 'app-photo-management',
    templateUrl: './photo-management.component.html',
    styleUrls: ['./photo-management.component.css'],
    standalone: true,
    imports: []
})
export class PhotoManagementComponent {
  photos: Photo[] = [];
  private adminService = inject(AdminService);

  private adminUserStore = inject(AdminUserStore);
  private memberStore = inject(MemberStore);
  private memberService = inject(MembersService);
  private toastr = inject(ToastrService);

  userPhotosForApproval = this.adminUserStore.userPhotosForApproval;

  filteredUsers = computed(() =>
    this.userPhotosForApproval().filter((u: Member) => u.userPhotos && u.userPhotos.length > 0)
  );

  ngOnInit(): void {
    this.adminUserStore.loadUserPhotosForApproval(true);
  }

  approvePhoto(photoId: number, user: Member) {
    if (this.userPhotosForApproval().length === 0) return;

    this.adminUserStore.approvePhoto(photoId).subscribe({
      next: () => {
        // Update the local signal so the UI reacts immediately
        this.adminUserStore.updateUserPhotoApproval(user.id, photoId, true);
        this.adminUserStore.loadUserPhotosForApproval(true);
      },
      error: (err) => {
        console.error(err);

        // Show error notification
  const errorMessage = err?.error?.message || 'Error approving photo';
        this.toastr.error(
          `Error: ${errorMessage}`,
          'Error',
          { timeOut: 6000 }
        );
      },
    })
  }

  rejectPhoto(photoId: number, user: Member) {
    this.adminUserStore.rejectPhoto(photoId).subscribe({
      next: () => {
        this.adminUserStore.updateUserPhotoApproval(user.id, photoId, false);
        this.adminUserStore.loadUserPhotosForApproval(true);
      // Reload the list after rejection
        // this.adminUserStore.loadUserPhotosForApproval();
      },
      error: (err) => {
  const errorMessage = err?.error?.message || 'Error rejecting photo';
        this.toastr.error(`Error: ${errorMessage}`, 'Error', { timeOut: 6000 });
      },
    });
  }
}
