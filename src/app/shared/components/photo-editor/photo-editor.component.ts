import { Component, OnInit, inject, signal } from '@angular/core';
import { Member } from 'src/app/core/_models/member';
import { environment } from 'src/environments/environment';
import { NgClass, NgStyle, DecimalPipe } from '@angular/common';
import { Photo } from 'src/app/core/_models/photo';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { PhotoStore } from 'src/app/core/_stores/photo.store';
import { PhotoEditorDialogData } from 'src/app/core/_models/photoEditorDialogData';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-photo-editor',
    templateUrl: './photo-editor.component.html',
    styleUrls: ['./photo-editor.component.css'],
    imports: [MatDialogModule, MatButtonModule]
})
export class PhotoEditorComponent<T> implements OnInit {

  readonly dialogRef = inject(MatDialogRef<PhotoEditorComponent<T>>);
  readonly data = inject<PhotoEditorDialogData<T>>(MAT_DIALOG_DATA);

  private photoStore = inject(PhotoStore);
  private toastr = inject(ToastrService);

  // uploader = signal<FileUploader | undefined>(undefined);
  baseUrl = environment.apiUrl;
  uploadedPhotos = signal<Photo[]>([]);
  hasBaseDropzoneOver = signal(false);
  progress = signal<number>(0);

  user = this.photoStore.user;

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

    const file = input.files[0];
    const uploadPath = this.data.uploadPath;
    const entityId = this.data.getEntityIdentifier(this.data.entity);

    this.progress.set(0);

    this.photoStore.uploadPhoto(entityId, uploadPath, file).subscribe({
      next: (photo) => {
        this.uploadedPhotos.update(list => [...list, photo]);
        this.toastr.success('Photo uploaded');
      },
      error: () => this.toastr.error('Upload failed')
    });
  }

  setMainPhoto(photo: Photo) {
    const uploadPath = this.data.uploadPath;
    const entityId = this.data.getEntityIdentifier(this.data.entity);

    this.photoStore.setMainPhoto(entityId, uploadPath, photo).subscribe({
      next: () => this.toastr.success('Photo set as main'),
      error: () => this.toastr.error('Could not set main photo')
    });
  }

  deletePhoto(photo: Photo) {
    const uploadPath = this.data.uploadPath;
    const entityId = this.data.getEntityIdentifier(this.data.entity);

    this.photoStore.deletePhoto(entityId, uploadPath, photo.id);
  }

  /*initializeUploader() {
    const currentUser = this.user();
    const entityId = this.data.getEntityIdentifier(this.data.entity);

    this.uploader.set(
      new FileUploader({
        url: `${this.baseUrl}${this.data.uploadPath}/${entityId}`,
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
}
