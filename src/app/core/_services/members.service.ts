import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Member } from '../_models/member';
import { of, map, catchError, throwError, Observable } from 'rxjs';
import { UserParams } from '../_models/userParams';
import { AccountService } from './account.service';
import { getPaginatedResult, getPaginationHeaders } from './paginationHelper';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  private http = inject(HttpClient);
  private accountService = inject(AccountService);

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
      catchError(error => {
        console.error('❌ Error fetching members:', error);
        return throwError(() => new Error('Error fetching members'));
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
        console.error('Error to get users:', error);
        return throwError(() => new Error('Error to get users'));
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
      })
    )
  }

  setMainPhoto(photoId: number) {
    return this.http.put(this.baseUrl + 'user/set-main-photo/' + photoId, {});
  }

  deletePhoto(username: string, photoId: number) {
    return this.http.delete(this.baseUrl + 'user/delete-photo/' + username + '?photoId=' + photoId);
  }
}
