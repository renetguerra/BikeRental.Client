import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TimeagoModule } from 'ngx-timeago';
import { PresenceService } from 'src/app/core/_services/presence.service';
import { AccountService } from 'src/app/core/_services/account.service';
import { BikeService } from 'src/app/core/_services/bike.service';
import { NotificationService } from 'src/app/core/_services/notification.service';
import { GalleryModule } from 'ng-gallery';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { PhotoStore } from 'src/app/core/_stores/photo.store';
import { MatDividerModule } from '@angular/material/divider';
import { BikeStore } from 'src/app/core/_stores/bike.store';
import { Bike } from 'src/app/core/_models/bike';
import { PhotoEditorComponent } from 'src/app/shared/components/photo-editor/photo-editor.component';
import { PhotoDeleteComponent } from 'src/app/shared/components/photo-delete/photo-delete.component';
import { BikeRentalHistoryComponent } from 'src/app/features/rental/bike-rental-history/bike-rental-history.component';
import { RentStore } from 'src/app/core/_stores/rent.store';

@Component({
    selector: 'app-bike-detail',
    templateUrl: './bike-detail.component.html',
    styleUrls: ['./bike-detail.component.css'],
    imports: [CommonModule, GalleryModule, TimeagoModule,
        BikeRentalHistoryComponent,
        MatDialogModule, MatIconModule, MatButtonModule, MatDividerModule]
})
export class BikeDetailComponent implements OnInit {

  private accountService = inject(AccountService);
  public presenceService = inject(PresenceService);
  private bikeService = inject(BikeService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  readonly dialog = inject(MatDialog);

  private bikeStore = inject(BikeStore);
  public rentStore = inject(RentStore);
  private photoStore = inject(PhotoStore);

  readonly user = signal(this.accountService.currentUser());
  bike = this.bikeStore.bike;
  bikes = this.bikeStore.bikes;

  activeTab = signal<string>('info');
  userNameParam = signal<string>('');

  galleryImages = this.photoStore.galleryBikeImages;

  readonly bikeById = this.bikeStore.bikeById;

  // Computed property to check whether rental history data exists
  readonly hasRentalHistory = computed(() => {
    const history = this.rentStore.bikeRentalHistory();
    return history && history.length > 0;
  });

  // Effects must be in constructor or field initializers (injection context)
  constructor() {
    // Placeholder: effects could be added here if needed in the future
  }

  ngOnInit(): void {
    this.user.set(this.accountService.currentUser()!);

    this.route.data.subscribe({
      next: data => {
        this.bikeStore.setBike(data['bike']);
        // Load rental history for this bike
        if (data['bike']?.id) {
          this.rentStore.loadRentalsByBike(data['bike'].id);
        }
      }
    })

    this.route.queryParams.subscribe({
      next: params => {
        if (params['tab']) {
          this.setActiveTab(params['tab']);
        }
      }
    })
  }

  setBike(bike: Bike) {
    this.bikeStore.setBike(bike);
  }

  setActiveTab(tab: string) {
  // Validate that the tab should be shown
    if (tab === 'history' && !this.hasRentalHistory()) {
      this.activeTab.set('info');
      return;
    }
    this.activeTab.set(tab);
  }

  openDialogAddPhoto() {
    this.dialog.open(PhotoEditorComponent<Bike>, {
      data: {
        entity: this.bike(),
        urlServerPath: 'bike/add-photo/',
        getEntityIdentifier: (b: Bike) => b.id.toString()
      }
    });
  }

  openDialogDeletePhoto() {
    this.dialog.open(PhotoDeleteComponent<Bike>, {
      data: {
        entity: this.bike(),
        getEntityIdentifier: (b: Bike) => b.id.toString()
      }
    });
  }

  rentBike() {
    if (!this.bike()) return;
    const bikeId = this.bike()!.id;
    const bikeName = `${this.bike()!.brand} ${this.bike()!.model}`;

    this.rentStore.rentBike(bikeId).subscribe({
      next: (response) => {
        console.log('OK', response);

        // Show success notification
        this.notificationService.success(
          `¡Bicicleta ${bikeName} alquilada exitosamente! 🚴‍♂️`,
          5000
        );

        // Reload rental history after a successful rental
        this.rentStore.loadRentalsByBike(bikeId);
        // Also reload the bike to update its state
        this.bikeService.getBike(bikeId).subscribe(updatedBike => {
          this.bikeStore.setBike(updatedBike);
        });
      },
      error: (err) => {
        console.error(err);

        // Show error notification
        const errorMessage = err?.error?.message || 'Error al alquilar la bicicleta';
        this.notificationService.error(
          `Error: ${errorMessage}`,
          6000
        );
      },
    });
  }

  editBike() {
    if (!this.bike()) return;
    this.router.navigateByUrl(`/bike/edit/${this.bike()!.id}`);
  }

}
