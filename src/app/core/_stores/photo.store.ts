import { Injectable, inject, signal, computed, effect } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { Member } from "../_models/member";
import { Photo } from "../_models/photo";
import { PhotoConfig } from "../_models/genericPhotoConfig";
import { MembersService } from "../_services/members.service";
import { ImageItem } from "ng-gallery";
import { AccountService } from "../_services/account.service";
import { MemberStore } from "./member.store";
import { User } from "../_models/user";
import { BikeStore } from "./bike.store";
import { HttpEventType, HttpEvent } from "@angular/common/http";
import { GenericPhotoService } from "../_services/genericPhoto.service";
import { tap, of, map, Observable, EMPTY, filter } from "rxjs";

/**
 * PhotoStore - Centralized store for generic photo management
 *
 * CURRENT ARCHITECTURE:
 * PhotoEditorComponent → PhotoStore → GenericPhotoService → PhotoService → HTTP Client
 *
 * RECOMMENDED METHODS (use GenericPhotoService):
 * - uploadAndAddPhoto<T>() - Upload + add photo in a single operation
 * - setMainPhotoAndUpdate<T>() - Set main photo + update entity
 * - deletePhotoAndUpdate<T>() - Delete photo + update entity
 *
 * LEGACY METHODS (backwards compatibility):
 * - addPhoto() - Member only
 * - addPhotoToBike() - Bike only
 * - uploadPhoto(), setMainPhoto(), deletePhoto() - Basic deprecated methods
 *
 * RECOMMENDED USAGE:
 * photoStore.uploadAndAddPhoto(entity, config, urlServerPath, file, updateCallback);
 */
@Injectable({ providedIn: 'root' })
export class PhotoStore {

  private genericPhotoService = inject(GenericPhotoService);
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

  addPhotoToEntity<T>(
    entity: T,
    photo: Photo,
    config: {
      photosProperty: keyof T,
      photoUrlProperty?: keyof T,
      updateEntityFn: (updatedEntity: T) => void,
      updateCurrentUser?: boolean
    }
  ) {
    const currentPhotos = (entity[config.photosProperty] as Photo[]) || [];
    const updatedPhotos = [...currentPhotos, photo];

    // Mark only the new photo as main when applicable
    const processedPhotos = updatedPhotos.map(p => ({
      ...p,
      isMain: p.id === photo.id ? photo.isMain : (photo.isMain ? false : p.isMain)
    }));

    const updatedEntity: T = {
      ...entity,
      [config.photosProperty]: processedPhotos,
      ...(config.photoUrlProperty && photo.isMain ?
        { [config.photoUrlProperty]: photo.url } : {}
      )
    } as T;

    config.updateEntityFn(updatedEntity);

    // Update current user if needed (Member only)
    if (config.updateCurrentUser && photo.isMain) {
      const currentUser = this.user();
      if (currentUser) {
        const updatedUser = { ...currentUser, photoUrl: photo.url };
        this.accountService.setCurrentUser(updatedUser);
        this.user.set(updatedUser);
      }
    }
  }

  // Member-specific method (maintain compatibility)
  addPhoto(photo: Photo) {
    const current = this.member();
    if (!current) return;

    this.addPhotoToEntity(current, photo, {
      photosProperty: 'userPhotos',
      photoUrlProperty: 'photoUrl',
      updateEntityFn: (updatedMember) => this.memberStore.setMember(updatedMember),
      updateCurrentUser: true
    });
  }

  // Bike-specific method
  addPhotoToBike(photo: Photo) {
    const current = this.bike();
    if (!current) return;

    this.addPhotoToEntity(current, photo, {
      photosProperty: 'bikePhotos',
      photoUrlProperty: 'photoUrl',
      updateEntityFn: (updatedBike) => this.bikeStore.setBike(updatedBike),
      updateCurrentUser: false
    });
  }

  setMainPhotoForEntity<T>(
    entity: T,
    photo: Photo,
    config: {
      photosProperty: keyof T,
      photoUrlProperty?: keyof T,
      updateEntityFn: (updatedEntity: T) => void,
      updateCurrentUser?: boolean
    }
  ) {
    const currentPhotos = (entity[config.photosProperty] as Photo[]) || [];

    const updatedPhotos = currentPhotos.map(p => ({
      ...p,
      isMain: p.id === photo.id
    }));

    const updatedEntity: T = {
      ...entity,
      [config.photosProperty]: updatedPhotos,
      ...(config.photoUrlProperty ?
        { [config.photoUrlProperty]: photo.url } : {}
      )
    } as T;

    config.updateEntityFn(updatedEntity);

    // Update current user if needed (Member only)
    if (config.updateCurrentUser) {
      const currentUser = this.user();
      if (currentUser) {
        const updatedUser = { ...currentUser, photoUrl: photo.url };
        this.accountService.setCurrentUser(updatedUser);
        this.user.set(updatedUser);
      }
    }
  }

  deletePhotoFromEntity<T>(
    entity: T,
    photoId: number,
    config: {
      photosProperty: keyof T,
      updateEntityFn: (updatedEntity: T) => void
    }
  ) {
    const currentPhotos = (entity[config.photosProperty] as Photo[]) || [];
    const updatedPhotos = currentPhotos.filter(p => p.id !== photoId);

    const updatedEntity: T = {
      ...entity,
      [config.photosProperty]: updatedPhotos
    } as T;

    config.updateEntityFn(updatedEntity);
  }

  // Métodos genéricos usando PhotoConfig
  addPhotoWithConfig<T>(
    entity: T,
    photo: Photo,
    config: PhotoConfig<T>,
    updateEntityFn: (updatedEntity: T) => void,
    updateCurrentUser: boolean = false
  ) {
    this.addPhotoToEntity(entity, photo, {
      photosProperty: config.photosProperty,
      photoUrlProperty: config.photoUrlProperty,
      updateEntityFn,
      updateCurrentUser
    });
  }

  setMainPhotoWithConfig<T>(
    entity: T,
    photo: Photo,
    config: PhotoConfig<T>,
    updateEntityFn: (updatedEntity: T) => void,
    updateCurrentUser: boolean = false
  ) {
    this.setMainPhotoForEntity(entity, photo, {
      photosProperty: config.photosProperty,
      photoUrlProperty: config.photoUrlProperty,
      updateEntityFn,
      updateCurrentUser
    });
  }

  deletePhotoWithConfig<T>(
    entity: T,
    photoId: number,
    config: PhotoConfig<T>,
    updateEntityFn: (updatedEntity: T) => void
  ) {
    this.deletePhotoFromEntity(entity, photoId, {
      photosProperty: config.photosProperty,
      updateEntityFn
    });
  }

  // Método que combina upload + addPhotoToEntity usando GenericPhotoService
  uploadAndAddPhoto<T>(
    entity: T,
    config: PhotoConfig<T>,
    urlServerPath: string,
    file: File,
    updateEntityFn: (updatedEntity: T, photo: Photo) => void,
    updateCurrentUser: boolean = false
  ): Observable<Photo> {
    const token = this.accountService.currentUser()?.token;
    if (!token) {
      this.toastr.error('Authentication required');
      return EMPTY;
    }

    return this.genericPhotoService.uploadPhoto(
      entity,
      config,
      urlServerPath,
      file,
      token,
      (photo, updatedEntity) => {
        updateEntityFn(updatedEntity, photo);

        // Actualizar usuario actual si es necesario (solo para Member)
        if (updateCurrentUser && photo.isMain) {
          const currentUser = this.user();
          if (currentUser) {
            const updatedUser = { ...currentUser, photoUrl: photo.url };
            this.accountService.setCurrentUser(updatedUser);
            this.user.set(updatedUser);
          }
        }
      }
    ).pipe(
      map(result => result.photo)
    );
  }

  // Método que combina setMainPhoto + actualización local usando GenericPhotoService
  setMainPhotoAndUpdate<T>(
    entity: T,
    photo: Photo,
    config: PhotoConfig<T>,
    urlServerPath: string,
    updateEntityFn: (updatedEntity: T) => void,
    updateCurrentUser: boolean = false
  ): Observable<Photo> {
    return this.genericPhotoService.setMainPhoto(
      entity,
      config,
      urlServerPath,
      photo,
      (photo, updatedEntity) => {
        updateEntityFn(updatedEntity);

        // Actualizar usuario actual si es necesario (solo para Member)
        if (updateCurrentUser) {
          const currentUser = this.user();
          if (currentUser) {
            const updatedUser = { ...currentUser, photoUrl: photo.url };
            this.accountService.setCurrentUser(updatedUser);
            this.user.set(updatedUser);
          }
        }
      }
    ).pipe(
      map(result => result.photo)
    );
  }

  /**
   * @deprecated Use uploadAndAddPhoto with GenericPhotoService instead
   * Legacy method kept for compatibility
   */
  uploadPhoto(entityId: string, urlServerPath: string, file: File): Observable<Photo> {
    const token = this.accountService.currentUser()?.token;
    if (!token) return EMPTY as Observable<Photo>;

    const formData = new FormData();
    formData.append('file', file);

    // Delegate to GenericPhotoService
    // Since the entity is not available here, use the legacy PhotoService
    // Build full upload URL
    let fullUploadUrl = urlServerPath;
    if (!urlServerPath.endsWith('/') && entityId) {
      fullUploadUrl += '/';
    }
    fullUploadUrl += entityId;
    return this.genericPhotoService['photoService'].uploadPhoto(fullUploadUrl, formData, token).pipe(
      map((event: HttpEvent<Photo>) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.progress.set(Math.round((100 * event.loaded) / event.total));
        } else if (event.type === HttpEventType.Response) {
          const photo = event.body as Photo;
          return photo;
        }
        return null;
      }),
      filter((p): p is Photo => !!p)
    );
  }

  /**
   * @deprecated Use setMainPhotoAndUpdate with GenericPhotoService instead
   * Legacy method kept for compatibility
   */
  setMainPhoto(entityId: string, urlServerPath: string, photo: Photo): Observable<Photo> {
    if (!entityId) return of(photo);

  // Delegate to GenericPhotoService
    return this.genericPhotoService['photoService'].setMainPhoto(entityId, urlServerPath, photo.id).pipe(
      map(() => photo)
    );
  }

  /**
   * @deprecated Use GenericPhotoService.deletePhoto instead
   * Legacy method kept for compatibility
   */
  deletePhoto(entityId: string, urlServerPath: string, photoId: number) {
  // Delegate to GenericPhotoService
    this.genericPhotoService['photoService'].deletePhoto(entityId, urlServerPath, photoId).subscribe({
      next: () => {
        this.toastr.success('Photo deleted');
      },
      error: () => this.toastr.error('Could not delete photo')
    });
  }

  // Delete photo and update entity using GenericPhotoService
  deletePhotoAndUpdate<T>(
    entity: T,
    photoId: number,
    config: PhotoConfig<T>,
    urlServerPath: string,
    updateEntityFn: (updatedEntity: T) => void
  ): Observable<number> {
    return this.genericPhotoService.deletePhoto(
      entity,
      config,
      urlServerPath,
      photoId,
      (photoId, updatedEntity) => {
        updateEntityFn(updatedEntity);
      }
    ).pipe(
      map(result => result.photoId)
    );
  }
}
