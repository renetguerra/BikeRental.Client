import { ChangeDetectorRef, Component, OnInit, inject, signal, computed, ViewEncapsulation } from '@angular/core';
import { Member } from 'src/app/core/_models/member';
import { environment } from 'src/environments/environment';
import { NgClass, NgStyle, DecimalPipe } from '@angular/common';
import { Photo } from 'src/app/core/_models/photo';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { PhotoEditorDialogData } from 'src/app/core/_models/photoEditorDialogData';
import { ToastrService } from 'ngx-toastr';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { PhotoStore } from 'src/app/core/_stores/photo.store';
import { AccountService } from 'src/app/core/_services/account.service';

/**
 * PhotoEditorComponent - Generic component to edit photos for ANY entity
 *
 * Architecture flow (Angular best practices):
 * Component → PhotoStore → GenericPhotoService → HTTP Client
 *
 * Usage example:
 * this.dialog.open(PhotoEditorComponent<MyEntity>, {
 *   data: {
 *     entity: this.myEntity,
 *     urlServerPath: 'my-entity/add-photo',
 *     photoConfig: {
 *       photosProperty: 'images',            // ← name of the photos property
 *       photoUrlProperty: 'mainImage',       // ← name of the main image property
 *       getEntityIdentifier: (e) => e.id.toString()  // ← how to get the ID
 *     },
 *     onPhotoAdded: (photo, updated) => this.myStore.setEntity(updated)
 *   }
 * });
 */
@Component({
    selector: 'app-photo-editor',
    templateUrl: './photo-editor.component.html',
    styleUrls: ['./photo-editor.component.css'],
    encapsulation: ViewEncapsulation.None,
    imports: [MatDialogModule, MatButtonModule, MatProgressBarModule, MatIconModule]
})
export class PhotoEditorComponent<T> implements OnInit {

  readonly dialogRef = inject(MatDialogRef<PhotoEditorComponent<T>>);
  readonly data = inject<PhotoEditorDialogData<T>>(MAT_DIALOG_DATA);

  private photoStore = inject(PhotoStore);
  private accountService = inject(AccountService);
  private toastr = inject(ToastrService);

  baseUrl = environment.apiUrl;
  uploadedPhotos = signal<Photo[]>([]);
  hasBaseDropzoneOver = signal(false);
  progress = signal<number>(0);

  updatedEntity = signal<T>(this.data.entity);

  // Existing photos from the entity
  existingPhotos = computed(() => {
    const entity = this.updatedEntity();
    if (!entity || !this.data.photoConfig) {
      console.warn('PhotoEditorComponent: photoConfig is missing or entity is undefined.');
      return [];
    }
    const photosProperty = this.data.photoConfig.photosProperty;
    const photos = (entity as any)[photosProperty] as Photo[] || [];
    return photos;
  });

  // All photos (existing + newly uploaded)
  allPhotos = computed(() => {
    return [...this.existingPhotos(), ...this.uploadedPhotos()];
  });

  constructor() {}

  ngOnInit(): void {
    // this.initializeUploader();
  }

  fileOverBase(e: any) {
    this.hasBaseDropzoneOver.set(e);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const files = Array.from(input.files);
    this.processFiles(files);

    // Clear the input to allow selecting the same file again
    input.value = '';
  }

  private uploadFilesSequentially(files: File[], entityId: string, urlServerPath: string, index: number) {
    if (index >= files.length) {
      console.log('All files uploaded successfully');
      return;
    }

    const file = files[index];
    console.log(`Uploading file ${index + 1}/${files.length}: ${file.name}`);

    this.photoStore.uploadAndAddPhoto(
      this.updatedEntity(),
      this.data.photoConfig,
      urlServerPath,
      file,
      (updatedEntity, photo) => {
        console.log(`File ${index + 1} uploaded successfully:`, photo);

  // Update the entity
        this.updatedEntity.set(updatedEntity);

  // Add to uploadedPhotos
        this.uploadedPhotos.update(list => [...list, photo]);

  // Callback
        if (this.data.onPhotoAdded) {
          this.data.onPhotoAdded(photo, updatedEntity);
        }

  // Continue with the next file
        setTimeout(() => {
          this.uploadFilesSequentially(files, entityId, urlServerPath, index + 1);
  }, 100); // Small delay to avoid concurrency issues
      }
    ).subscribe({
      error: (error) => {
        console.error(`Upload failed for file ${file.name}:`, error);
        this.toastr.error(`Upload failed for ${file.name}`);
        // Continuar con el siguiente archivo a pesar del error
        this.uploadFilesSequentially(files, entityId, urlServerPath, index + 1);
      }
    });
  }

  uploadPhoto(entityId: string, urlServerPath: string, file: File) {
    console.log('Starting upload for file:', file.name);
    console.log('Current entity before upload:', this.updatedEntity());

    this.photoStore.uploadAndAddPhoto(
      this.updatedEntity(),
      this.data.photoConfig,
      urlServerPath,
      file,
      (updatedEntity, photo) => {
        console.log('Photo uploaded successfully:', photo);
        console.log('Updated entity received:', updatedEntity);

  // Update the entity first
        this.updatedEntity.set(updatedEntity);

  // Add to uploadedPhotos to display in the "Recently Uploaded" section
        this.uploadedPhotos.update(list => {
          console.log('Current uploadedPhotos before update:', list);
          const newList = [...list, photo];
          console.log('New uploadedPhotos after update:', newList);
          return newList;
        });

        // Call the callback if provided
        if (this.data.onPhotoAdded) {
          this.data.onPhotoAdded(photo, updatedEntity);
        }
      }
    ).subscribe({
      error: (error) => {
        console.error('Upload failed for file:', file.name, error);
        this.toastr.error('Upload failed');
      }
    });
  }

  setMainPhoto(photo: Photo) {
  // For setMainPhoto, derive base path from urlServerPath (must be add-photo)
  const entity = this.data.urlServerPath.split('/')[0]; // 'user' or 'bike'
    const setMainPhotoPath = entity + '/set-main-photo/';

    this.photoStore.setMainPhotoAndUpdate(
      this.updatedEntity(),
      photo,
      this.data.photoConfig,
      setMainPhotoPath,
      (updatedEntity) => {
        this.updatedEntity.set(updatedEntity);

  // Call the callback if provided
        if (this.data.onMainPhotoSet) {
          this.data.onMainPhotoSet(photo, updatedEntity);
        }
      }
    ).subscribe({
      next: () => this.toastr.success('Photo set as main'),
      error: () => this.toastr.error('Could not set main photo')
    });
  }

  deletePhoto(photo: Photo) {
  // For deletePhoto, derive base path from urlServerPath
  const entity = this.data.urlServerPath.split('/')[0]; // 'user' or 'bike'
    const deletePhotoPath = entity + '/delete-photo/';

    this.photoStore.deletePhotoAndUpdate(
      this.updatedEntity(),
      photo.id,
      this.data.photoConfig,
      deletePhotoPath,
      (updatedEntity) => {
  // Update the entity (this automatically refreshes existingPhotos)
        this.updatedEntity.set(updatedEntity);

  // Remove from uploadedPhotos if it was there as well
        this.uploadedPhotos.update(list => list.filter(p => p.id !== photo.id));

        // Call the callback if provided
        if (this.data.onPhotoDeleted) {
          this.data.onPhotoDeleted(photo.id, updatedEntity);
        }
      }
    ).subscribe({
      next: () => this.toastr.success('Photo deleted'),
      error: () => this.toastr.error('Could not delete photo')
    });
  }

  /*initializeUploader() {
    const currentUser = this.user();
    const entityId = this.data.photoConfig.getEntityIdentifier(this.data.entity);

    this.uploader.set(
      new FileUploader({
        url: `${this.baseUrl}${this.data.urlServerPath}/${entityId}`,
        authToken: 'Bearer ' + currentUser!.token,
        isHTML5: true,
        allowedFileType: ['image'],
        removeAfterUpload: true,
        autoUpload: false,
        maxFileSize: 10 * 1024 * 1024
      })
  );

    this.uploader()!.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    }

    this.uploader()!.onSuccessItem = (item, response, status, headers) => {
      if (!response) return;
      const photo: Photo = JSON.parse(response);
      this.uploadedPhotos.push(photo);
    };

    this.uploader()!.onCompleteAll = () => {
      this.uploadedPhotos.forEach(photo => {
        this.photoStore.addPhoto(photo);
      });
      this.dialogRef.close();
    };
  }*/

  // Handle drag over
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.hasBaseDropzoneOver.set(true);
  }

  // Handle drag leave
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.hasBaseDropzoneOver.set(false);
  }

  // Handle drag and drop
  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.hasBaseDropzoneOver.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFiles(Array.from(files));
    }
  }

  // Process selected or dropped files
  private processFiles(files: File[]): void {

    // Filter only image files
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      this.toastr.warning('Please select only image files');
      return;
    }

    if (imageFiles.length !== files.length) {
      this.toastr.info(`${files.length - imageFiles.length} non-image files were ignored`);
    }

    // Get upload configuration
    const urlServerPath = this.data.urlServerPath;
    const entityId = this.data.photoConfig.getEntityIdentifier(this.data.entity);

    console.log(`Starting upload of ${imageFiles.length} files to ${urlServerPath}/${entityId}`);
    this.progress.set(0);

    // Process files sequentially to avoid concurrency issues
    this.uploadFilesSequentially(imageFiles, entityId, urlServerPath, 0);
  }

  // Method to close dialog
  closeDialog(): void {
    this.dialogRef.close();
  }
}
