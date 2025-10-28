import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from 'src/environments/environment';
import { User } from '../_models/user';
import { Notification } from '../_models/notification';
import { catchError, map, of, throwError } from 'rxjs';
import { getPaginationHeaders, getPaginatedResult } from './paginationHelper';
import { GenericItem, SearchParamGenericResult } from '../_models/generic';
import { Photo } from '../_models/photo';
import { UserParams } from '../_models/userParams';
import { Member } from '../_models/member';
import { Bike } from '../_models/bike';
import { BikeParams } from '../_models/bikeParams';
import { MembersService } from './members.service';
import { AccountService } from './account.service';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root'
})

export class AdminService {
  baseUrl = environment.apiUrl;

  private http = inject(HttpClient);
  private membersService = inject(MembersService);
  private accountService = inject(AccountService);
  private transloco = inject(TranslocoService);

  arrayGeneric: GenericItem<unknown>[] = [];
  genericParamsResult: SearchParamGenericResult<unknown> | undefined;

  user = this.accountService.currentUser();

  members = signal<Member[]>([]);
  memberCache = new Map();
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

  getUsersWithRoles() {
    return this.http.get<User[]>(this.baseUrl + 'admin/users-with-roles').pipe(
      map(users => {
        this.showNotification(this.transloco.translate('adminService.getUsersWithRolesSuccess'));
        return users;
      }),
      catchError(error => {
        this.showNotification(this.transloco.translate('adminService.getUsersWithRolesError'));
        return throwError(() => error);
      })
    );
  }

  updateUserRoles(username: string, roles: string[]) {
    return this.http.post<string[]>(this.baseUrl + 'admin/edit-roles/'
      + username  + '?roles=' + roles, {}).pipe(
      map(response => {
        this.showNotification(this.transloco.translate('adminService.updateUserRolesSuccess'));
        return response;
      }),
      catchError(error => {
        this.showNotification(this.transloco.translate('adminService.updateUserRolesError'));
        return throwError(() => error);
      })
    );
  }

  createUserNotifications(username: string, notifications: Notification[]) {
      return this.http.post(`${this.baseUrl}admin/create-notifications/${username}`, notifications).pipe(
        map(response => {
          this.showNotification(this.transloco.translate('adminService.createUserNotificationsSuccess'));
          return response;
        }),
        catchError(error => {
          this.showNotification(this.transloco.translate('adminService.createUserNotificationsError'));
          return throwError(() => error);
        })
      );
  }

  getUserPhotosForApproval(userParams: UserParams, forceReload = false) {
    const cacheKey = Object.values(userParams).join('-');
    const cached = this.memberCache.get(cacheKey);

    if (cached && !forceReload) return of(cached);

    let params = getPaginationHeaders(userParams.pageNumber(), userParams.pageSize);

    params = params.append('minAge', userParams.minAge);
    params = params.append('maxAge', userParams.maxAge);
    params = params.append('gender', userParams.gender);
    params = params.append('orderBy', userParams.orderBy);

    return getPaginatedResult<Member[]>(this.baseUrl + 'admin/userPhotos-to-moderate', params, this.http).pipe(
      map(response => {
        this.memberCache.set(cacheKey, response);
        this.members.set(response.result || []);
        this.showNotification(this.transloco.translate('adminService.getUserPhotosForApprovalSuccess'));
        return response;
      }),
      catchError(error => {
        this.showNotification(this.transloco.translate('adminService.getUserPhotosForApprovalError'));
        return throwError(() => error);
      })
    );
  }

  private showNotification(message: string) {
    // Implement notification logic here (e.g., Toastr, Snackbar, etc.)
    console.log(message);
  }

  getUserPhotosForApprovalByUser(userId: number) {
    return this.membersService.getMember(userId.toString());
  }

  approvePhoto(photoId: number) {
    return this.http.put(this.baseUrl + 'admin/approve-photo/' + photoId, {});
  }

  rejectPhoto(photoId: number) {
    return this.http.put(this.baseUrl + 'admin/reject-photo/' + photoId, {});
  }

  //#region Generic
  getGenericParams<T>() {
    this.genericParamsResult = new SearchParamGenericResult<T>;
    return this.genericParamsResult;
  }

  setGenericParams<T>() {
    this.genericParamsResult = new SearchParamGenericResult<T>;
  }

  resetGenericParams<T>() {
      this.genericParamsResult = new SearchParamGenericResult<T>;
      return this.genericParamsResult;
  }

  loadAll<T>(pageNumber: number, pageSize: number, url: string) {
    const params = getPaginationHeaders(pageNumber, pageSize);
    return getPaginatedResult<T[]>(this.baseUrl + url, params, this.http);
  }

  getAll<T>(url: string) {
    return this.http.get<T[]>(this.baseUrl + url);
  }

  getById<T>(id: number, url: string){
    return this.http.get<T | unknown>(this.baseUrl + url + id);
  }

  create<T extends GenericItem<unknown>>(url: string, item: T) {
    return this.http.post<T>(this.baseUrl + url, item).pipe(
      map((response: T) => {
        this.arrayGeneric.push(response);
        return response;
      })
    );
  }

  update<T extends GenericItem<unknown>>(url: string, item: T){
    return this.http.put<T>(this.baseUrl + url, item).pipe(
      map(() => {
        const index = this.arrayGeneric.indexOf(item);
        this.arrayGeneric[index] = { ...this.arrayGeneric[index], ...item }
        return this.arrayGeneric[index];
      })
    );
  }

  save<T extends GenericItem<unknown>>(url: string, item: T){
    if (item['id'] === 0) {
      return this.create(url, item);
    }
    return this.update(url, item);
  }

  delete(id: number, url: string) {
    return this.http.delete(this.baseUrl + url + id).pipe(
      map(() => {
        this.arrayGeneric.splice(id, 1);
      })
    );
  }

  remove<T extends GenericItem<unknown>>(url: string, item: T) {
    return this.http.delete<T>(this.baseUrl + url, {
      body: item
    }).pipe(
      map(() => {
        this.arrayGeneric.splice(this.arrayGeneric.indexOf(item), 1);
        return item;
      })
    );
  }
  //#endregion
}
