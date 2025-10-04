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

@Component({
    selector: 'app-photo-delete',
    templateUrl: './photo-delete.component.html',
    styleUrls: ['./photo-delete.component.css'],
    imports: [NgClass, GalleryModule, MatDialogModule, MatButtonModule]
})
export class PhotoDeleteComponent<T> implements OnInit {
  private accountService = inject(AccountService);
  readonly dialogRef = inject(MatDialogRef<PhotoDeleteComponent<T>>);
  readonly data = inject<PhotoEditorDialogData<T>>(MAT_DIALOG_DATA);
  readonly getEntityIdentifier = this.data.getEntityIdentifier;

  readonly photoStore = inject(PhotoStore);
  readonly memberStore = inject(MemberStore);

  user = signal<User>(this.accountService.currentUser()!);
  entity = signal(this.data.entity);
  userPhotos = computed(() => this.photoStore.userPhotos());


  constructor() {
  }

  ngOnInit(): void { }

  setMainPhoto(photo: Photo) {
    const uploadPath = this.data.uploadPath;
    const entityId = this.data.getEntityIdentifier(this.data.entity);

    this.photoStore.setMainPhoto(entityId, uploadPath, photo)
  }

  deletePhoto(photoId: number) {
    const uploadPath = this.data.uploadPath;
    const entityId = this.data.getEntityIdentifier(this.data.entity);

    this.photoStore.deletePhoto(entityId, uploadPath, photoId);
  }

}
