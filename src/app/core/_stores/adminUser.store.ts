import { computed, inject, Injectable, signal } from '@angular/core';
import { User } from '../_models/user';
import { AdminService } from '../_services/admin.service';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { filter, switchMap, tap } from 'rxjs';
import { MembersService } from '../_services/members.service';
import { UserParams } from '../_models/userParams';
import { AccountService } from '../_services/account.service';
import { Photo } from '../_models/photo';
import { Member } from '../_models/member';

@Injectable({ providedIn: 'root' })
export class AdminUserStore {
  private accountService = inject(AccountService);
  private adminService = inject(AdminService);
  private memberService = inject(MembersService);

  private _users = signal<User[]>([]);
  readonly users = computed(() => this._users());

  readonly currentUser = computed(() => this.accountService.currentUser());

  readonly userParams = signal<UserParams>(
    this.memberService.getUserParams() ?? new UserParams(this.currentUser()!)
  );
  private triggerLoad = signal(false);

  // public _userPhotosForApproval = signal<Member[]>([]);
  // readonly userPhotosForApproval = this._userPhotosForApproval.asReadonly();

  readonly userPhotosForApprovalResponse = toSignal(
    toObservable(this.triggerLoad!).pipe(
      filter((load) => load === true),
      switchMap((params) =>
        this.adminService.getUserPhotosForApproval(this.userParams()!).pipe(
          tap((res) => {
            this.memberService.setUserParams(this.userParams()!);
            this.triggerLoad.set(false);
          })
        )
      )
    ),
    {
      initialValue: {
        result: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          itemsPerPage: 3,
          totalItems: 0,
        },
      },
    }
  );

  readonly userPhotosForApproval = computed(
    () => this.userPhotosForApprovalResponse().result
  );

  readonly pagination = computed(
    () => this.userPhotosForApprovalResponse().pagination
  );

  readonly approvePhoto = (photoId: number) => {
    return this.adminService.approvePhoto(photoId).pipe(
      tap(() => {
        this.loadUserPhotosForApproval();
      })
    );
  };

  private readonly _userPhotoForApproval = signal<Member | undefined>(
    undefined
  );
  readonly userPhotoForApproval = this._userPhotoForApproval.asReadonly();

  loadUserPhotosForApproval() {
    // this.triggerLoad.set(true);
    this.triggerLoad.update((v) => !v);
  }

  loadUserPhotosForApprovalByUser(userId: number) {
    this.adminService.getUserPhotosForApprovalByUser(userId).subscribe({
      next: (userPhotos) => this._userPhotoForApproval.set(userPhotos),
    });
  }

  setUsers(users: User[]) {
    this._users.set(users);
  }

  updateUserRoles(username: string, roles: string[]) {
    const updatedUsers = this._users().map((user) => {
      if (user.username === username) {
        return { ...user, roles };
      }
      return user;
    });
    this._users.set(updatedUsers);
  }
}
