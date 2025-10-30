import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Member } from '../_models/member';
import { of, map, catchError, throwError, Observable } from 'rxjs';
import { UserParams } from '../_models/userParams';
import { AccountService } from './account.service';
import { getPaginatedResult, getPaginationHeaders } from './paginationHelper';
import { TranslocoService } from '@jsverse/transloco';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  private http = inject(HttpClient);
  private accountService = inject(AccountService);
  private transloco = inject(TranslocoService);
  private toastr = inject(ToastrService);

  baseUrl = environment.apiUrl;
  members = signal<Member[]>([]);
  memberCache = new Map();
  user = this.accountService.currentUser();
  userParams = signal<UserParams | undefined>(undefined);

  constructor() {
    if (this.user)
      this.userParams.set(new UserParams(this.user));
  }

  getUserParams() {
    return this.userParams();
  }

  setUserParams(userParams: UserParams) {
    this.userParams.set(userParams);
  }

  resetUserParams() {
    if (this.user) {
      this.userParams.set(new UserParams(this.user));
      return this.userParams();
    }
    return;
  }

  getMembers(userParams: UserParams, forceReload = false) {
    const cacheKey = Object.values(userParams).join('-');
    const cached = this.memberCache.get(cacheKey);

    if (cached && !forceReload) return of(cached);

    let params = getPaginationHeaders(userParams.pageNumber(), userParams.pageSize);

    params = params.append('minAge', userParams.minAge);
    params = params.append('maxAge', userParams.maxAge);
    params = params.append('gender', userParams.gender);
    params = params.append('orderBy', userParams.orderBy);

    return getPaginatedResult<Member[]>(this.baseUrl + 'user', params, this.http).pipe(
      map(response => {
        this.memberCache.set(cacheKey, response);
        this.members.set(response.result || []);
        return response;
      }),
        catchError((error) => {
          this.transloco.selectTranslate('membersService.fetchMembersError').subscribe(msg => {
            this.toastr.error(msg);
          });
          console.error(error);
          return throwError(() => error);
        })
    );
  }

  getMembersWithoutCacheAndPagination(): Observable<Member[]> {
    return this.http.get<Member[]>(this.baseUrl + 'user/all-users').pipe(
      map(members => {
        this.members.set(members);
        return members;
      }),
        catchError(error => {
          const msg = this.transloco.translate('membersService.fetchAllUsersError');
          this.toastr.error(msg);
          return throwError(() => new Error(msg));
        })
    );
  }

  getMember(username: string): Observable<Member> {
    const member = this.members().find(m => m.username === username);
    if (member) return of(member);

    return this.http.get<Member>(`${this.baseUrl}user/${username}`).pipe(
      map(member => {
        this.members.update(list => [...list, member]);
        return member;
      })
    );
  }

  updateMember(member: Member) {
    return this.http.put(this.baseUrl + 'user', member).pipe(
      map(() => {
        this.members.update(list =>
          list.map(m => (m.username === member.username ? { ...m, ...member } : m))
        );
          const msg = this.transloco.translate('membersService.updateSuccess');
          this.toastr.success(msg);
      })
        ,
        catchError(error => {
          const msg = this.transloco.translate('membersService.updateError');
          this.toastr.error(msg);
          return throwError(() => new Error(msg));
        })
    )
  }

  setMainPhoto(photoId: number) {
      return this.http.put(this.baseUrl + 'user/set-main-photo/' + photoId, {}).pipe(
        map(() => {
          const msg = this.transloco.translate('membersService.setMainPhotoSuccess');
          this.toastr.success(msg);
        }),
        catchError(error => {
          const msg = this.transloco.translate('membersService.setMainPhotoError');
          this.toastr.error(msg);
          return throwError(() => new Error(msg));
        })
      );
  }

  deletePhoto(username: string, photoId: number) {
      return this.http.delete(this.baseUrl + 'user/delete-photo/' + username + '?photoId=' + photoId).pipe(
        map(() => {
          const msg = this.transloco.translate('membersService.deletePhotoSuccess');
          this.toastr.success(msg);
        }),
        catchError(error => {
          const msg = this.transloco.translate('membersService.deletePhotoError');
          this.toastr.error(msg);
          return throwError(() => new Error(msg));
        })
      );
  }
}
