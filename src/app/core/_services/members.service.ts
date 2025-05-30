import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Member } from '../_models/member';
import { of, map, catchError, throwError } from 'rxjs';
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
    if (this.user) this.userParams.set(new UserParams(this.user));
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

  getMembers(userParams: UserParams) {
    const response = this.memberCache.get(Object.values(userParams).join('-'));

    if (response) return of(response);

    let params = getPaginationHeaders(userParams.pageNumber(), userParams.pageSize);

    params = params.append('minAge', userParams.minAge);
    params = params.append('maxAge', userParams.maxAge);
    params = params.append('gender', userParams.gender);
    params = params.append('orderBy', userParams.orderBy);

    return getPaginatedResult<Member[]>(this.baseUrl + 'user', params, this.http).pipe(
      map(response => {
        this.memberCache.set(Object.values(userParams).join('-'), response);
        return response;
      })
    )
  }

  getMembersWithoutCacheAndPagination() {        
    return this.http.get<Member[]>(this.baseUrl + 'user/all-users').pipe(
      catchError(error => {
        console.error('Error en la petición HTTP:', error);
        return throwError(() => new Error('Error al obtener los usuarios'));
      })
    )
  }

  getMember(username: string) {
    // const member = [...this.memberCache.values()]
    //   .reduce((arr, elem) => arr.concat(elem.result), [])
    //   .find((member: Member) => member.username === username);

    // if (member) return of(member);
    
    return this.http.get<Member>(this.baseUrl + 'user/' + username);
  }

  updateMember(member: Member) {
    return this.http.put(this.baseUrl + 'user', member).pipe(
      map(() => {
        const index = this.members().indexOf(member);
        this.members()[index] = { ...this.members()[index], ...member }
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