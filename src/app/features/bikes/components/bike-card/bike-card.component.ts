import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { PresenceService } from 'src/app/core/_services/presence.service';
import { CommonModule } from '@angular/common';
import { Bike } from 'src/app/core/_models/bike';
import { MatIconModule } from '@angular/material/icon';
import { RentStore } from 'src/app/core/_stores/rent.store';
import { Rental } from 'src/app/core/_models/rental';
import { LikeStore } from 'src/app/core/_stores/like.store';
import { MemberStore } from 'src/app/core/_stores/member.store';
import { RouterLink, RouterModule } from '@angular/router';
import { BikeStore } from 'src/app/core/_stores/bike.store';
import { BikeService } from 'src/app/core/_services/bike.service';

@Component({
  selector: 'app-bike-card',
  templateUrl: './bike-card.component.html',
  styleUrls: ['./bike-card.component.css'],
  imports: [CommonModule, RouterModule, RouterLink, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BikeCardComponent implements OnInit {
  public presenceService = inject(PresenceService);
  public memberStore = inject(MemberStore);
  public bikeService = inject(BikeService);
  public rentStore = inject(RentStore);
  public likeStore = inject(LikeStore);

  bike = input<Bike | undefined>();

  rentals = signal<Rental[]>([]);

  memberId = this.memberStore.member()?.id;

  hasLiked = computed(() =>
    this.likeStore.bikeFavoritesIds()?.includes(this.bike()!.id)
  );

  ngOnInit() {
    this.likeStore.loadBikeFavoritesIds();
  }

  toggleLikeBike() {
    if (!this.bike()) return;
    const bikeId = this.bike()!.id;
    this.likeStore.toggleLikeBike(bikeId).subscribe({
      next: () => {
        const current = this.likeStore.bikeFavoritesIds();
        const updated = this.hasLiked()
          ? current!.filter((id) => id !== bikeId)
          : [...current!, bikeId];        

        this.likeStore.likeIds.set(updated);

        this.likeStore.loadBikeFavorites();        
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  rentBike() {
    if (!this.bike()) return;
    this.rentStore.rentBike(this.bike()!.id).subscribe({
      next: (response) => {
        console.log('OK', response);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  returnBike() {
    if (!this.bike()) return;
    this.rentStore.returnBike(this.bike()!.id).subscribe({
      next: (response) => {
        console.log('OK', response);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
}
