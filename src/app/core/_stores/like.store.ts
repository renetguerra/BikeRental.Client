import { Injectable, inject, computed, signal } from '@angular/core';
import { filter, switchMap, tap } from 'rxjs';
import { AccountService } from '../_services/account.service';
import { BikeService } from '../_services/bike.service';
import { LikeService } from '../_services/like.service';
import { BikeStore } from './bike.store';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Params } from '../_models/params';

@Injectable({ providedIn: 'root' })
export class LikeStore {
  private accountService = inject(AccountService);
  private likeService = inject(LikeService);
  private bikeService = inject(BikeService);

  private bikeStore = inject(BikeStore);

  readonly user = computed(() => this.accountService.currentUser());

  readonly params = signal<Params | null>(new Params());

  likeIds = signal<number[]>([]);

  readonly bike = this.bikeStore.bike;
  
  public triggerLoad = signal<boolean>(false);
  private triggerLoadIds = signal<boolean>(false);

  readonly bikeFavoritesResponse = toSignal(
    toObservable(this.triggerLoad).pipe(
      filter((load) => load === true),
      switchMap((params) =>
        this.likeService.getLikedBikes(this.params()!).pipe(
          tap((res) => {            
            this.triggerLoad.set(false);
            this.likeService.likeCache.clear();
          })
        )
      )
    ),
    { initialValue: { result: [], pagination: undefined } }
  );

  readonly bikeFavoritesIdsResponse = toSignal(
    toObservable(this.triggerLoadIds).pipe(
      filter((load) => load === true),
      switchMap(() =>
        this.likeService.getLikeIds(this.user()!.username).pipe(
          tap((res: number[]) => {            
            this.likeIds.set(res);
            this.triggerLoadIds.set(false);
          })
        )
      )
    ),
    { initialValue: null }
  );

  readonly bikeFavorites = computed(() => this.bikeFavoritesResponse().result);
  readonly pagination = computed(() => this.bikeFavoritesResponse().pagination);

  readonly bikeFavoritesIds = computed(() => this.likeIds());

  readonly toggleLikeBike = (bikeId: number) => {
    return this.likeService.toggleLikeBike(bikeId).pipe(
      tap(() => {
        this.bikeService.clearBikeCache();
        this.bikeStore.loadBikes();
      })
    );
  };

  loadBikeFavorites() {
    this.triggerLoad.set(true);
  }

  loadBikeFavoritesIds() {
    this.triggerLoadIds.set(true);
  } 

  changePage(page: number) {
    const current = this.params();
    if (current && current.pageNumber() !== page) {
      const updated = current;
      updated.pageNumber.set(page);
      this.params.set(updated);
      this.loadBikeFavorites();
    }
  }
}
