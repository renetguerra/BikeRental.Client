import { Injectable, inject, signal, computed, effect } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { Member } from "../_models/member";
import { Photo } from "../_models/photo";
import { MembersService } from "../_services/members.service";
import { ImageItem } from "ng-gallery";
import { AccountService } from "../_services/account.service";
import { MemberStore } from "./member.store";
import { User } from "../_models/user";
import { BikeStore } from "./bike.store";
import { HttpEventType } from "@angular/common/http";
import { PhotoService } from "../_services/photo.service";
import { tap, of, map, Observable, EMPTY, filter } from "rxjs";

type EntityType = 'user' | 'bike';

@Injectable({ providedIn: 'root' })
export class PhotoStore {

  private photoService = inject(PhotoService);
  private memberService = inject(MembersService);
  private accountService = inject(AccountService);
  private toastr = inject(ToastrService);

  private memberStore = inject(MemberStore);
  private bikeStore = inject(BikeStore);

  readonly user = signal(this.accountService.currentUser());

  readonly member = this.memberStore.member;
  readonly userPhotos = computed(() => this.member()?.userPhotos ?? []);

  readonly bike = this.bikeStore.bike;
  readonly bikePhotos = computed(() => this.bike()?.bikePhotos ?? []);

  //uploader = signal<FileUploader | undefined>(undefined);
  readonly uploadedPhotos = signal<Photo[]>([]);
  readonly progress = signal<number>(0);

  hasBaseDropzoneOver = false;

  private readonly _galleryHomePhotos = signal<Photo[]>([]);
  readonly galleryHomePhotos = this._galleryHomePhotos.asReadonly();

  readonly galleryImages = computed(() => {
    const member = this.member();
    if (!member) return [];
    return member.userPhotos.map(photo =>
      new ImageItem({ src: photo.url, thumb: photo.url })
    );
  });

  readonly galleryBikeImages = computed(() => {
    const bike = this.bike();
    if (!bike) return [];
    return bike.bikePhotos.map(photo =>
      new ImageItem({ src: photo.url, thumb: photo.url })
    );
  });

  fileOverBase(e: any) {
    this.hasBaseDropzoneOver = e;
  }

  addPhoto(photo: Photo) {
    const current = this.member();
    const currentUser = this.user();

    if (!current || !currentUser) return;

    const updatedPhotos = [...current.userPhotos, photo];
    const updatedMember: Member = {
      ...current,
      photoUrl: photo.isMain ? photo.url : current.photoUrl,
      userPhotos: updatedPhotos.map(p => ({
        ...p,
        isMain: p.id === photo.id
      }))
    };

    this.memberStore.setMember(updatedMember);

    if (photo.isMain) {
      const updatedUser = { ...currentUser, photoUrl: photo.url };
      this.accountService.setCurrentUser(updatedUser);
      this.user.set(updatedUser);
    }
  }

  /*uploadPhoto(entityId: string, uploadPath: string, file: File): Observable<Photo> {
    const token = this.accountService.currentUser()?.token;
    if (!token) return;

    const formData = new FormData();
    formData.append('file', file);

    this.photoService.uploadPhoto(entityId, uploadPath, formData, token).subscribe({
      next: event => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.progress.set(Math.round((100 * event.loaded) / event.total));
        } else if (event.type === HttpEventType.Response) {
          const photo = event.body as Photo;
          this.uploadedPhotos.update(list => [...list, photo]);

          // Update the store with the new photo
          if (entityId === 'user') {
            const member = this.memberStore.member();
            if (!member) return;
            this.memberStore.setMember({
              ...member,
              userPhotos: [...member.userPhotos, photo]
            });
          } else if (entityId === 'bike') {
            const bike = this.bikeStore.bike();
            if (!bike) return;
            this.bikeStore.setBike({
              ...bike,
              bikePhotos: [...bike.bikePhotos, photo]
            });
          }

          this.toastr.success('Photo uploaded');
        }
      },
      error: () => this.toastr.error('Upload failed')
    });
  }*/

    uploadPhoto(entityId: string, uploadPath: string, file: File): Observable<Photo> {
      const token = this.accountService.currentUser()?.token;
      if (!token) return EMPTY as Observable<Photo>;

      const formData = new FormData();
      formData.append('file', file);

      return this.photoService.uploadPhoto(entityId, uploadPath, formData, token).pipe(
        map(event => {
          if (event.type === HttpEventType.Response) {
            const photo = event.body as Photo;

            this.updateMainPhotoLocal(entityId, photo);

            return photo; // esto se emite al subscribe
          }
          return null;
        }),
        filter((p): p is Photo => !!p) // filtramos nulls
      );
    }

  private updateMainPhotoLocal(entityId: string, photo: Photo) {
    if (entityId === 'user') {
      const member = this.memberStore.member();
      if (!member) return;

      this.memberStore.setMember({
        ...member,
        photoUrl: photo.url,
        userPhotos: member.userPhotos.map(p => ({ ...p, isMain: p.id === photo.id }))
      });
    } else {
      const bike = this.bikeStore.bike();
      if (!bike) return;

      this.bikeStore.setBike({
        ...bike!,
        bikePhotos: bike!.bikePhotos.map(p => ({ ...p, isMain: p.id === photo.id }))
      });
    }
  }

  /*setMainPhoto(entityId: string, uploadPath: string, photo: Photo) {
    this.photoService.setMainPhoto(photo.id).subscribe({
      next: () => {
        if (entityId === 'user') {
          this.memberStore.setMainPhotoLocal(photo);
        } else if (entityId === 'bike') {
          this.bikeStore.setMainPhotoLocal(photo);
        }

        if (entityId === 'user') {
          this.accountService.setCurrentUser({
            ...this.accountService.currentUser()!,
            photoUrl: photo.url
          });
        }

        this.toastr.success('Photo set as main');
      },
      error: () => this.toastr.error('Could not set main photo')
    });
  }*/

  setMainPhoto(entityId: string, uploadPath: string, photo: Photo) : Observable<Photo> {
    //const entityType = entityId == 'user' ? this.memberStore.member()?.username : this.bikeStore.bike()?.id.toString();

    if (!entityId) return of(photo);

    return this.photoService.setMainPhoto(entityId, uploadPath, photo.id).pipe(
      tap(() => this.updateMainPhotoLocal(entityId, photo)),
      map(()=> photo)
    );
  }

  deletePhoto(entityId: string, uploadPath: string, photoId: number) {
    if (entityId === 'user') {
      const member = this.memberStore.member();
      if (!member) return;

      this.photoService.deletePhoto(entityId, uploadPath, photoId).subscribe({
        next: () => {
          this.memberStore.setMember({
            ...member,
            userPhotos: member.userPhotos.filter(p => p.id !== photoId)
          });
          this.toastr.success('Photo deleted');
        },
        error: () => this.toastr.error('Could not delete photo')
      });
    } else {
      const bike = this.bikeStore.bike();
      if (!bike) return;

      this.photoService.deletePhoto(entityId, uploadPath, photoId).subscribe({
        next: () => {
          this.bikeStore.setBike({
            ...bike,
            bikePhotos: bike.bikePhotos.filter(p => p.id !== photoId)
          });
          this.toastr.success('Photo deleted');
        },
        error: () => this.toastr.error('Could not delete photo')
      });
    }
  }

  /*deletePhoto(photoId: number) {
    const username = this.member()?.username;
    if (!username) return;

    this.memberService.deletePhoto(username, photoId).subscribe({
      next: () => {
        const updated = {
          ...this.member()!,
          userPhotos: this.member()!.userPhotos.filter(p => p.id !== photoId)
        };
        this.memberStore.setMember(updated);
        this.toastr.success('Photo deleted');
      },
      error: () => {
        this.toastr.error('Could not delete photo');
      }
    });
  }

  setMainPhoto(photo: Photo) {
    const member = this.member();
    if (!member) return;

    this.memberService.setMainPhoto(photo.id).subscribe({
      next: () => {

        const updatedPhotos = member.userPhotos.map(p => ({
          ...p,
          isMain: p.id === photo.id
        }));

        const updatedMember: Member = {
            ...member,
            photoUrl: photo.url,
            userPhotos: updatedPhotos
          };

        this.memberStore.setMember(updatedMember);

        this.accountService.setCurrentUser({
            ...this.accountService.currentUser()!,
            photoUrl: photo.url
          });

        this.toastr.success('Photo set as main');
      },
      error: () => {
        this.toastr.error('Could not set photo as main');
      }
    });
  }*/
}
