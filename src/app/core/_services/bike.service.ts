import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { environment } from 'src/environments/environment';
import { of, map, catchError, throwError } from 'rxjs';
import { AccountService } from './account.service';
import { getPaginatedResult, getPaginationHeaders } from './paginationHelper';
import { Bike } from '../_models/bike';
import { BikeParams } from '../_models/bikeParams';

@Injectable({
  providedIn: 'root'
})
export class BikeService {
  private http = inject(HttpClient);
  private accountService = inject(AccountService);

  baseUrl = environment.apiUrl;
  bikes = signal<Bike[]>([]);
  bikeCache = new Map();
  bikeParams = signal<BikeParams | undefined>(undefined);

  getBikeParams() {
    return this.bikeParams();
  }

  setBikeParams(bikeParams: BikeParams) {
    this.bikeParams.set(bikeParams);
  }

  resetBikeParams() {
    this.bikeParams.set(new BikeParams(this.bikes()[0]));
    return this.bikeParams();
  }

  getBikes(bikeParams: BikeParams) {
    const response = this.bikeCache.get(Object.values(bikeParams).join('-'));

    if (response) return of(response);

    let params = getPaginationHeaders(bikeParams.pageNumber(), bikeParams.pageSize);

    params = params.append('type', bikeParams.type);
    params = params.append('year', bikeParams.year);
    params = params.append('model', bikeParams.model);
    params = params.append('brand', bikeParams.brand);
    params = params.append('minPrice', bikeParams.minPrice);
    params = params.append('maxPrice', bikeParams.maxPrice);
    params = params.append('isAvailable', bikeParams.isAvailable);
    params = params.append('orderBy', bikeParams.orderBy);

    return getPaginatedResult<Bike[]>(this.baseUrl + 'bike/list', params, this.http).pipe(
      map(response => {
        this.bikeCache.set(Object.values(bikeParams).join('-'), response);
        return response;
      })
    )
  }

  getBikesWithoutCacheAndPagination() {
    return this.http.get<Bike[]>(this.baseUrl + 'bike/all-bikes').pipe(
      catchError(error => {
        console.error('HTTP request error:', error);
        return throwError(() => new Error('Error fetching bikes'));
      })
    )
  }

  getBike(id: number) {
    return this.http.get<Bike>(this.baseUrl + 'bike/' + id);
  }

  updateBike(bike: Bike) {
    return this.http.put(this.baseUrl + 'bike', bike).pipe(
      map(() => {
        const index = this.bikes().indexOf(bike);
        this.bikes()[index] = { ...this.bikes()[index], ...bike }
      })
    )
  }

  setMainPhoto(photoId: number) {
    return this.http.put(this.baseUrl + 'bike/set-main-photo/' + photoId, {});
  }

  deletePhoto(bikeId: number, photoId: number) {
    return this.http.delete(this.baseUrl + 'bike/delete-photo/' + bikeId + '?photoId=' + photoId);
  }

  clearBikeCache() {
    this.bikeCache.clear();
  }


}
