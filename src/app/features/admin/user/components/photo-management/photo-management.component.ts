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
    this.adminUserStore.loadUserPhotosForApproval();
  }

  approvePhoto(photoId: number, user: Member) {
    if (this.userPhotosForApproval().length === 0) return;

    this.adminUserStore.approvePhoto(photoId).subscribe({
      next: () => {
        // Update the local signal so the UI reacts immediately
        this.adminUserStore.userPhotosForApproval().update((users: Member[]) =>
          users.map(u =>
            u.id === user.id
              ? {
                  ...u,
                  userPhotos: u.userPhotos.map((photo: Photo) =>
                    photo.id === photoId
                      ? { ...photo, isApproved: true }
                      : photo
                  )
                }
              : u
          )
        );
      },
      error: (err) => {
        console.error(err);

        // Show error notification
        const errorMessage = err?.error?.message || 'Error al aprobar la foto';
        this.toastr.error(
          `Error: ${errorMessage}`,
          'Error',
          { timeOut: 6000 }
        );
      },
    })
  }

  rejectPhoto(photoId: number) {
    this.adminService.rejectPhoto(photoId).subscribe({
      next: () => this.photos.splice(this.photos.findIndex(p => p.id === photoId), 1)
    })
  }
}
