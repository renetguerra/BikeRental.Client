import { Injectable, inject, signal } from "@angular/core";
import { environment } from "src/environments/environment";
import { AccountService } from "./account.service";
import { HttpClient } from "@angular/common/http";
import { Params } from "../_models/params";
import { Bike } from "../_models/bike";
import { getPaginatedResult, getPaginationHeaders } from "./paginationHelper";
import { map, of } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class LikeService {
  private http = inject(HttpClient);
  private accountService = inject(AccountService);

  baseUrl = environment.apiUrl;    
  user = this.accountService.currentUser();  
  
  likeCache = new Map();  
  
  toggleLikeBike(bikeId: number) {
    return this.http.post(this.baseUrl + 'likes/' + bikeId, {});
  }      

  getLikedBikes(likeParams: Params) {
    const response = this.likeCache.get(Object.values(likeParams).join('-'));
  
      if (response) return of(response);

    let params = getPaginationHeaders(likeParams.pageNumber(), likeParams.pageSize);
    
    return getPaginatedResult<Bike[]>(this.baseUrl + 'likes', params, this.http).pipe(
        map(response => {
          this.likeCache.set(Object.values(likeParams).join('-'), response);
          return response;
        })
      )
  }

  getLikeIds(username: string) {
    return this.http.get<number[]>(this.baseUrl + 'likes/list/' + username);
  }

}