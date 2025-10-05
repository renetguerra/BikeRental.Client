import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { Member } from 'src/app/core/_models/member';
import { User } from 'src/app/core/_models/user';
import { AccountService } from 'src/app/core/_services/account.service';
import { NgClass } from '@angular/common';
import { Photo } from 'src/app/core/_models/photo';
import { GalleryModule } from 'ng-gallery';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { PhotoStore } from 'src/app/core/_stores/photo.store';
import { MemberStore } from 'src/app/core/_stores/member.store';
import { PhotoEditorDialogData } from 'src/app/core/_models/photoEditorDialogData';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-photo-delete',
    templateUrl: './photo-delete.component.html',
    styleUrls: ['./photo-delete.component.css'],
    imports: [NgClass, GalleryModule, MatDialogModule, MatButtonModule]
})
export class PhotoDeleteComponent<T> implements OnInit {
  private accountService = inject(AccountService);
  private toastr = inject(ToastrService);
  readonly dialogRef = inject(MatDialogRef<PhotoDeleteComponent<T>>);
  readonly data = inject<PhotoEditorDialogData<T>>(MAT_DIALOG_DATA);
  readonly getEntityIdentifier = this.data.photoConfig.getEntityIdentifier;

  readonly photoStore = inject(PhotoStore);
  readonly memberStore = inject(MemberStore);

  user = signal<User>(this.accountService.currentUser()!);
  entity = signal(this.data.entity);

  // Fotos genéricas basadas en la configuración
  photos = computed(() => {
    const currentEntity = this.entity();
    if (!currentEntity) return [];

    const photosProperty = this.data.photoConfig.photosProperty;
    return (currentEntity as any)[photosProperty] as Photo[] || [];
  });

  // Para compatibilidad hacia atrás con el template
  userPhotos = this.photos;

  // Verificar si el usuario actual puede editar esta entidad
  canEdit = computed(() => {
    const currentUser = this.user();
    const currentEntity = this.entity();
    if (!currentUser || !currentEntity) return false;

    const entityId = this.data.photoConfig.getEntityIdentifier(currentEntity);
    return entityId === currentUser.username ||
           currentUser.roles?.includes('Admin');
  });


  constructor() {
  }

  ngOnInit(): void { }

  setMainPhoto(photo: Photo) {
    const entity = this.data.urlServerPath.split('/')[0]; // 'user' o 'bike'
    const urlServerPath = entity + '/set-main-photo/';

    this.photoStore.setMainPhotoAndUpdate(
      this.data.entity,
      photo,
      this.data.photoConfig,
      urlServerPath,
      (updatedEntity) => {
        this.entity.set(updatedEntity);

        // Call the callback if provided
        if (this.data.onMainPhotoSet) {
          this.data.onMainPhotoSet(photo, updatedEntity);
        }
      }
    ).subscribe({
      next: () => this.toastr.success('Photo set as main'),
      error: (error) => {
        console.error('Could not set main photo', error);
        this.toastr.error('Could not set main photo');
      }
    });
  }

  deletePhoto(photo: Photo) {
    const urlServerPath = this.data.urlServerPath;

    this.photoStore.deletePhotoAndUpdate(
      this.data.entity,
      photo.id,
      this.data.photoConfig,
      urlServerPath,
      (updatedEntity) => {
        this.entity.set(updatedEntity);

        // Call the callback if provided
        if (this.data.onPhotoDeleted) {
          this.data.onPhotoDeleted(photo.id, updatedEntity);
        }
      }
    ).subscribe({
      next: () => {
        this.toastr.success('Photo deleted successfully');
        // Cerrar el diálogo si no quedan fotos
        if (this.photos().length === 0) {
          this.dialogRef.close();
        }
      },
      error: (error) => {
        console.error('Could not delete photo', error);
        this.toastr.error('Could not delete photo');
      }
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

}
