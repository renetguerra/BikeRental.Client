import { computed, effect, inject, Injectable, signal } from "@angular/core";
import { toSignal, toObservable } from "@angular/core/rxjs-interop";
import { filter, switchMap, tap } from "rxjs";
import { AccountService } from "../_services/account.service";
import { MembersService } from "../_services/members.service";
import { Member } from "../_models/member";
import { UserParams } from "../_models/userParams";
import { Bike } from "../_models/bike";
import { BikeService } from "../_services/bike.service";
import { BikeParams } from "../_models/bikeParams";

@Injectable({ providedIn: 'root' })
export class BikeStore {

  private accountService = inject(AccountService);  
  private bikeService = inject(BikeService);

  readonly user = signal(this.accountService.currentUser());

  private _bike = signal<Bike | null>(null);
  readonly bike = this._bike.asReadonly()  

  readonly bikeParams = signal<BikeParams | null>(this.bikeService.getBikeParams()! ?? new BikeParams(this.bike()!));

  private triggerLoad = signal(false);

  readonly bikesResponse = toSignal(
      toObservable(this.triggerLoad!).pipe(
        filter(load => load === true),
        switchMap(params =>
          this.bikeService.getBikes(this.bikeParams()!).pipe(
            tap(res => {              
              this.bikeService.setBikeParams(this.bikeParams()!);
              this.triggerLoad.set(false);
            })
          )
        )
      ),
      { initialValue: { result: [], pagination: undefined } }
    );
    
  readonly bikes = computed(() => this.bikesResponse().result);
  readonly pagination = computed(() => this.bikesResponse().pagination);

  readonly bikeById = toSignal(
      toObservable(computed(() => this.bike()?.id)).pipe(
          filter((id): id is number => !!id),
          switchMap(id => this.bikeService.getBike(id))
      ),
      { initialValue: null }
  );  
  
  readonly updateBike = (bike: Bike) => {
      return this.bikeService.updateBike(bike).pipe(
          tap(() => this.setBike(bike))
      );
  };  

  constructor() {           
    effect(() => {
      const value = this.bikeById();
      if (value) this._bike.set(value);
    });
  }    

  loadBikes() {
    this.triggerLoad.set(true);
  }

  setBikeParams(params: BikeParams) {    
    this.bikeParams.set(params);
    this.bikeService.setBikeParams(params);
    this.loadBikes();
  }

  resetFilters() {
      const resetParams = this.bikeService.resetBikeParams();      
      this.bikeParams.set(resetParams!);
  }

  changePage(page: number) {
      const current = this.bikeParams();
      if (current && current.pageNumber() !== page) {          
          const updated = current;
          updated.pageNumber.set(page);
          this.setBikeParams(updated);
      }
  }        

  setBike(bike: Bike) {
      this._bike.set(bike);
  } 
}