import {
  Component,
  HostListener,
  OnInit,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from 'src/app/core/_services/notification.service';
import { AccountService } from 'src/app/core/_services/account.service';
import { TimeagoModule } from 'ngx-timeago';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GalleryModule } from 'ng-gallery';
import { PhotoStore } from 'src/app/core/_stores/photo.store';
import { PhotoEditorComponent } from 'src/app/shared/components/photo-editor/photo-editor.component';
import { BikeStore } from 'src/app/core/_stores/bike.store';
import { Bike } from 'src/app/core/_models/bike';
import { Photo } from 'src/app/core/_models/photo';

@Component({
  selector: 'app-bike-edit',
  templateUrl: './bike-edit.component.html',
  styleUrls: ['./bike-edit.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    TimeagoModule,
    GalleryModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
  ],
})
export class BikeEditComponent implements OnInit {
  private accountService = inject(AccountService);
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  readonly dialog = inject(MatDialog);

  private bikeStore = inject(BikeStore);
  private photoStore = inject(PhotoStore);

  editForm = viewChild<NgForm>('editForm');
  @HostListener('window:beforeunload', ['$event']) unloadNotification(
    $event: BeforeUnloadEvent
  ) {
    if (this.editForm()?.dirty) {
      $event.returnValue = true;
    }
  }

  user = this.accountService.currentUser();
  bike = this.bikeStore.bike;
  bikeIdParam = signal<number>(0);

  galleryImages = this.photoStore.galleryBikeImages;

  ngOnInit(): void {
    this.route.data.subscribe({
      next: (data) => {
        this.bikeStore.setBike(data['bike']);
      },
    });

    // Verify if the current user is an administrator
    const user = this.accountService.currentUser();
    if (!user?.roles?.includes('Admin')) {
      this.notificationService.error(
        'You do not have permission to edit bikes'
      );
      this.router.navigateByUrl('/bikes');
      return;
    }
  }

  updateBike() {
    const formValue = this.editForm()?.value;
    if (!formValue) return;

    const current = this.bike();
    if (!current) return;

    const updatedBike: Bike = {
      ...current,
      ...formValue,
    };

    this.bikeStore.updateBike(updatedBike).subscribe({
      next: () => {
        this.notificationService.success('Bike updated successfully');
        this.editForm()?.reset(updatedBike);
        this.router.navigateByUrl(`/bike/${current.id}`);
      },
      error: () => {
        this.notificationService.error('Error updating the bike');
      },
    });
  }

  openDialogAddPhoto() {
    this.dialog.open(PhotoEditorComponent<Bike>, {
      width: '800px',
      maxWidth: '90vw',
      height: 'auto',
      maxHeight: '80vh',
      panelClass: 'photo-editor-dialog',
      disableClose: true,
      hasBackdrop: true,
      backdropClass: 'photo-editor-backdrop',
      autoFocus: false,
      restoreFocus: false,
      data: {
        entity: this.bike(),
        urlServerPath: 'bike/add-photo/',
        photoConfig: {
          photosProperty: 'bikePhotos',
          photoUrlProperty: 'photoUrl',
          getEntityIdentifier: (b: Bike) => b.id.toString(),
        },
        onPhotoAdded: (photo: Photo, updatedBike: Bike) => {
          this.bikeStore.setBike(updatedBike);
        },
        onPhotoDeleted: (photoId: string, updatedBike: Bike) => {
          this.bikeStore.setBike(updatedBike);
        },
      },
    });
  }
}
