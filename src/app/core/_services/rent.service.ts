import { Injectable, inject, signal } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { environment } from "src/environments/environment";
import { AccountService } from "./account.service";
import { Rental } from "../_models/rental";
import { Pagination } from "../_models/pagination";
import { catchError, tap, throwError } from "rxjs";
import { CustomerRentalHistory } from "../_models/customerRentalHistory";
import { BikeRentalHistory } from "../_models/bikeRentalHistory";
import { TranslocoService } from "@jsverse/transloco";
import { ToastrService } from "ngx-toastr";

@Injectable({
  providedIn: 'root'
})
export class RentService {
  private http = inject(HttpClient);
  private accountService = inject(AccountService);
  private transloco = inject(TranslocoService);
  private toastr = inject(ToastrService);

  baseUrl = environment.apiUrl;
  rentals = signal<Rental[]>([]);
  rentalCache = new Map();
  user = this.accountService.currentUser();

  getRentalsByBike(bikeId: number) {
      return this.http.get<BikeRentalHistory>(this.baseUrl + 'rental/bike/' + bikeId).pipe(
        catchError(error => {
          const msg = this.transloco.translate('rentService.getRentalsError');
          this.toastr.error(msg);
          return throwError(() => new Error(msg));
        })
      );
  }

  getRentalsByBikeCustomer(bikeId: number, username: string) {
      return this.http.get<Rental[]>(this.baseUrl + 'rental/bike/' + bikeId + '?customer=' + username).pipe(
        catchError(error => {
          const msg = this.transloco.translate('rentService.getRentalsError');
          this.toastr.error(msg);
          return throwError(() => new Error(msg));
        })
      );
  }

  getCustomerRentalHistory(username: string) {
      return this.http.get<CustomerRentalHistory>(this.baseUrl + 'rental/customer/' + username + '/history').pipe(
        catchError(error => {
          const msg = this.transloco.translate('rentService.getCustomerRentalHistoryError');
          this.toastr.error(msg);
          return throwError(() => new Error(msg));
        })
      );
  }

  rentBike(bikeId: number) {
      return this.http.post(this.baseUrl + 'rental/' + bikeId, {}).pipe(
        tap(() => {
          const msg = this.transloco.translate('rentService.rentSuccess');
          this.toastr.success(msg);
        }),
        catchError(error => {
          const msg = this.transloco.translate('rentService.rentError');
          this.toastr.error(msg);
          return throwError(() => new Error(msg));
        })
      );
  }

  returnBike(bikeId: number) {
      return this.http.put(this.baseUrl + 'rental/return/' + bikeId, {}).pipe(
        tap(() => {
          const msg = this.transloco.translate('rentService.returnSuccess');
          this.toastr.success(msg);
        }),
        catchError(error => {
          const msg = this.transloco.translate('rentService.returnError');
          this.toastr.error(msg);
          return throwError(() => new Error(msg));
        })
      );
  }
}
