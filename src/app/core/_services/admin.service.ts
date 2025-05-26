import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { User } from '../_models/user';
import { Notification } from '../_models/notification';
import { map } from 'rxjs';
import { getPaginationHeaders, getPaginatedResult } from './paginationHelper';
import { GenericItem, SearchParamGenericResult } from '../_models/generic';

@Injectable({
  providedIn: 'root'
})

export class AdminService {
  baseUrl = environment.apiUrl;

  arrayGeneric: GenericItem<any>[] = [];  
  genericParamsResult: SearchParamGenericResult<any> | undefined;

  constructor(private http: HttpClient) { }

  getUsersWithRoles() {
    return this.http.get<User[]>(this.baseUrl + 'admin/users-with-roles');
  }

  updateUserRoles(username: string, roles: string[]) {
    return this.http.post<string[]>(this.baseUrl + 'admin/edit-roles/' 
      + username  + '?roles=' + roles, {});
  }

  updateCanSendMessages(username: string, canSendMessages: boolean) {
    return this.http.post(this.baseUrl + 'admin/update-can-send-messages/' 
      + username  + '?canSendMessages=' + canSendMessages, {});
  }

  createUserNotifications(username: string, notifications: Notification[]) {   
      return this.http.post(`${this.baseUrl}admin/create-notifications/${username}`, notifications);
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
    let params = getPaginationHeaders(pageNumber, pageSize);
    return getPaginatedResult<T[]>(this.baseUrl + url, params, this.http);
  } 

  getAll<T>(url: string) {
    return this.http.get<T[]>(this.baseUrl + url);
  }

  getById<T>(id: number, url: string){
    return this.http.get<T | any>(this.baseUrl + url + id);
  }  

  create<T extends GenericItem<any>>(url: string, item: T) {
    return this.http.post<T>(this.baseUrl + url, item).pipe(
      map((response: T) => {
        this.arrayGeneric.push(response);
        return response;
      })
    );
  }

  update<T extends GenericItem<any>>(url: string, item: T){
    return this.http.put<T>(this.baseUrl + url, item).pipe(
      map(() => {
        const index = this.arrayGeneric.indexOf(item);
        this.arrayGeneric[index] = { ...this.arrayGeneric[index], ...item }
        return this.arrayGeneric[index];
      })
    );    
  }

  save<T extends GenericItem<any>>(url: string, item: T){
    if (item['id'] === 0) {
      return this.create(url, item);
    }
    return this.update(url, item);
  }

  delete<T>(id: number, url: string) {
    return this.http.delete(this.baseUrl + url + id).pipe(
      map(() => {
        this.arrayGeneric.splice(id, 1);
      })
    );
  }

  remove<T extends GenericItem<any>>(url: string, item: T) {    
    return this.http.delete<T>(this.baseUrl + url, {
      body: item
    }).pipe(
      map(() => {        
        this.arrayGeneric.splice(this.arrayGeneric.indexOf(item), 1);        
        return item;
      })
    );
  }
}
