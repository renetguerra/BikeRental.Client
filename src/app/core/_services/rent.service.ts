import { Injectable, inject, signal } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { environment } from "src/environments/environment";
import { AccountService } from "./account.service";
import { Rental } from "../_models/rental";
import { Pagination } from "../_models/pagination";
import { catchError, tap, throwError } from "rxjs";
import { CustomerRentalHistory } from "../_models/customerRentalHistory";
import { BikeRentalHistory } from "../_models/bikeRentalHistory";

@Injectable({
  providedIn: 'root'
})
export class RentService {
  private http = inject(HttpClient);
  private accountService = inject(AccountService);

  baseUrl = environment.apiUrl;  
  rentals = signal<Rental[]>([]);
  rentalCache = new Map();
  user = this.accountService.currentUser();  

  getRentalsByBike(bikeId: number) {    
     return this.http.get<BikeRentalHistory>(this.baseUrl + 'rental/bike/' + bikeId).pipe(
      catchError(error => {
        console.error('Error HTTP request:', error);
        return throwError(() => new Error('Error getting rentals'));
      })
    );
  }

  getRentalsByBikeCustomer(bikeId: number, username: string) {
    return this.http.get<Rental[]>(this.baseUrl + 'rental/bike/' + bikeId + '?customer=' + username).pipe(
      catchError(error => {
        console.error('Error HTTP request:', error);
        return throwError(() => new Error('Error getting rentals'));
      })
    );
  }

  getCustomerRentalHistory(username: string) {        
    return this.http.get<CustomerRentalHistory>(this.baseUrl + 'rental/customer/' + username + '/history').pipe(
        catchError(error => {
        console.error('Error HTTP request:', error);
        return throwError(() => new Error('Error getting customer rental history'));
        })
    );        
  }  
  
  rentBike(bikeId: number) {
    return this.http.post(this.baseUrl + 'rental/' + bikeId, {});
  }    

  returnBike(bikeId: number) {
    return this.http.put(this.baseUrl + 'rental/return/' + bikeId, {});
  }
}