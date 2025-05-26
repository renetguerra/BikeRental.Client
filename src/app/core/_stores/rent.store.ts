import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { forkJoin, map, tap } from 'rxjs';
import { Bike } from '../_models/bike';
import { AccountService } from '../_services/account.service';
import { BikeService } from '../_services/bike.service';
import { RentService } from '../_services/rent.service';
import { Rental } from '../_models/rental';
import { BikeStore } from './bike.store';
import { Pagination } from '../_models/pagination';
import { CustomerRentalHistory } from '../_models/customerRentalHistory';
import { RentalHistory } from '../_models/rentalHistory';
import { RentalHistoryCustomer } from '../_models/rentalHistoryCustomer';
import { BikeRentalHistory } from '../_models/bikeRentalHistory';
import { User } from '../_models/user';

@Injectable({ providedIn: 'root' })
export class RentStore {
  private accountService = inject(AccountService);
  private rentService = inject(RentService);
  private bikeService = inject(BikeService);

  private bikeStore = inject(BikeStore);

  readonly user = computed(() => this.accountService.currentUser());

  private readonly _rentals = signal<Rental[]>([]);
  readonly rentals = this._rentals.asReadonly();

  private readonly _bikeRentals = signal<BikeRentalHistory | undefined>(
    undefined
  );
  readonly bikeRentals = this._bikeRentals.asReadonly();

  private readonly _customerRentals = signal<CustomerRentalHistory | undefined>(
    undefined
  );
  readonly customerRentals = this._customerRentals.asReadonly();

  //   readonly customerRentalHistory = signal<Rental[]>([]);

  readonly bike = this.bikeStore.bike;

  private readonly _userCache = signal(new Map<number, User>());
  readonly userCache = this._userCache.asReadonly();
  
  private readonly _bikeCache = signal(new Map<number, Bike>());
  readonly bikeCache = this._bikeCache.asReadonly();

  readonly pagination = signal<Pagination | undefined>(undefined);

  readonly rentBike = (bikeId: number) => {
    return this.rentService.rentBike(bikeId).pipe(
      tap(() => {
        this.bikeService.clearBikeCache();
        this.bikeStore.loadBikes();
      })
    );
  };

  readonly returnBike = (bikeId: number) => {
    return this.rentService.returnBike(bikeId).pipe(
      tap(() => {
        this.bikeService.clearBikeCache();
        this.bikeStore.loadBikes();
      })
    );
  };

  readonly bikeRentalHistory = computed<RentalHistoryCustomer[]>(() => {
    return this.bikeRentals()?.rentals ?? [];
  });

  readonly customerRentalHistory = computed<RentalHistory[]>(() => {
    return this.customerRentals()?.rentals ?? [];
  });
  

  constructor() {
    effect(() => {
      const bike = this.bike();
      const user = this.user();

      if (!bike || !user) return;

      this.loadRentalsByBike(bike.id);    
      this.loadBikeRentalsHistoryEffect();
      this.loadCustomerRentalsHistoryEffect();
    });
  }

  loadRentalsByBike(bikeId: number) {
    this.rentService.getRentalsByBike(bikeId).subscribe({
      next: (bikeRentals) => this._bikeRentals.set(bikeRentals),
    });
  }

  loadRentalsByBikeCustomer(bikeId: number, username: string) {
    this.rentService.getRentalsByBikeCustomer(bikeId, username).subscribe({
      next: (rentals) => this._rentals.set(rentals),
    });
  }

  loadCustomerRentals(username: string) {
    this.rentService.getCustomerRentalHistory(username).subscribe({
      next: (customerRentals) => this._customerRentals.set(customerRentals),
    });
  }

  private loadBikeRentalsHistoryEffect() {
    effect(() => {
      const bike = this.bike();
      if (!bike) return;

      this.rentService
        .getRentalsByBike(bike.id)
        .subscribe((bikeRentals) => {
          this._bikeRentals.set(bikeRentals);

          const bikesMap = this.bikeCache();
          const missingBikeIds = [
            ...new Set(bikeRentals.rentals.map((r) => r.bikeId)),
          ].filter((id) => !bikesMap.has(id));

          if (missingBikeIds.length === 0) return;

          const bikeRequests = missingBikeIds.map((id) =>
            this.bikeService.getBike(id).pipe(map((bike) => ({ id, bike })))
          );

          forkJoin(bikeRequests).subscribe((results) => {
            const updatedCache = new Map(bikesMap);
            results.forEach(({ id, bike }) => updatedCache.set(id, bike));
            this._bikeCache.set(updatedCache);
          });
        });
    });
  }

  private loadCustomerRentalsHistoryEffect() {
    effect(() => {
      const user = this.user();
      if (!user) return;

      this.rentService
        .getCustomerRentalHistory(this.user()!.username)
        .subscribe((customerRentals) => {
          this._customerRentals.set(customerRentals);

          const bikesMap = this.bikeCache();
          const missingBikeIds = [
            ...new Set(customerRentals.rentals.map((r) => r.bikeId)),
          ].filter((id) => !bikesMap.has(id));

          if (missingBikeIds.length === 0) return;

          const bikeRequests = missingBikeIds.map((id) =>
            this.bikeService.getBike(id).pipe(map((bike) => ({ id, bike })))
          );

          forkJoin(bikeRequests).subscribe((results) => {
            const updatedCache = new Map(bikesMap);
            results.forEach(({ id, bike }) => updatedCache.set(id, bike));
            this._bikeCache.set(updatedCache);
          });
        });
    });
  }
}
