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
  private accountService: AccountService;
  private rentService: RentService;
  private bikeService: BikeService;
  private bikeStore: BikeStore;

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
    // Initialize services using inject() in constructor
    this.accountService = inject(AccountService);
    this.rentService = inject(RentService);
    this.bikeService = inject(BikeService);
    this.bikeStore = inject(BikeStore);

    // getRentalsByBike
    effect(() => {
      const bike = this.bikeStore.bike();
      if (!bike || bike.id <= 0) return;

      this.rentService.getRentalsByBike(bike.id).subscribe((bikeRentals) => {
        this._bikeRentals.set(bikeRentals);

        // actualizar cache de bicis faltantes
        this.updateBikeCache(bikeRentals.rentals.map((r) => r.bikeId));
      });
    });

    // getCustomerRentalHistory
    effect(() => {
      const user = this.user();
      if (!user) return;

      this.rentService.getCustomerRentalHistory(user.username).subscribe((customerRentals) => {
        this._customerRentals.set(customerRentals);

        // actualizar cache de bicis faltantes
        this.updateBikeCache(customerRentals.rentals.map((r) => r.bikeId));
      });
    });
  }

  // Getter for bike property (must be after bikeStore initialization)
  get bike() {
    return this.bikeStore.bike;
  }

  private updateBikeCache(missingIds: number[]) {
    const bikesMap = this.bikeCache();
    const idsToFetch = [...new Set(missingIds)].filter((id) => id > 0 && !bikesMap.has(id));

    if (idsToFetch.length === 0) return;

    const bikeRequests = idsToFetch.map((id) =>
      this.bikeService.getBike(id).pipe(map((bike) => ({ id, bike })))
    );

    forkJoin(bikeRequests).subscribe((results) => {
      const updatedCache = new Map(bikesMap);
      results.forEach(({ id, bike }) => updatedCache.set(id, bike));
      this._bikeCache.set(updatedCache);
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

}
