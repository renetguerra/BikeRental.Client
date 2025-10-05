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
import { HttpEventType } from "@angular/common/http";
import { GenericPhotoService } from "../_services/genericPhoto.service";
import { tap, of, map, Observable, EMPTY, filter } from "rxjs";

/**
 * PhotoStore - Store centralizado para manejo de fotos genéricas
 *
 * ARQUITECTURA ACTUAL:
 * PhotoEditorComponent → PhotoStore → GenericPhotoService → PhotoService → HTTP Client
 *
 * MÉTODOS RECOMENDADOS (usan GenericPhotoService):
 * - uploadAndAddPhoto<T>() - Upload + agregar foto en una operación
 * - setMainPhotoAndUpdate<T>() - Establecer foto principal + actualizar entidad
 * - deletePhotoAndUpdate<T>() - Eliminar foto + actualizar entidad
 *
 * MÉTODOS LEGACY (compatibilidad hacia atrás):
 * - addPhoto() - Solo para Member
 * - addPhotoToBike() - Solo para Bike
 * - uploadPhoto(), setMainPhoto(), deletePhoto() - Métodos básicos deprecados
 *
 * USO RECOMENDADO:
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

    // Marcar solo la nueva foto como principal si es main
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

    // Actualizar usuario actual si es necesario (solo para Member)
    if (config.updateCurrentUser && photo.isMain) {
      const currentUser = this.user();
      if (currentUser) {
        const updatedUser = { ...currentUser, photoUrl: photo.url };
        this.accountService.setCurrentUser(updatedUser);
        this.user.set(updatedUser);
      }
    }
  }

  // Método específico para Member (mantener compatibilidad)
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

  // Método específico para Bike
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

    // Actualizar usuario actual si es necesario (solo para Member)
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

    // Delegamos al GenericPhotoService
    // Como no tenemos la entidad aquí, usamos el PhotoService legacy
    return this.genericPhotoService['photoService'].uploadPhoto(entityId, urlServerPath, formData, token).pipe(
      map(event => {
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

    // Delegamos al GenericPhotoService
    return this.genericPhotoService['photoService'].setMainPhoto(entityId, urlServerPath, photo.id).pipe(
      map(() => photo)
    );
  }

  /**
   * @deprecated Use GenericPhotoService.deletePhoto instead
   * Legacy method kept for compatibility
   */
  deletePhoto(entityId: string, urlServerPath: string, photoId: number) {
    // Delegamos al GenericPhotoService
    this.genericPhotoService['photoService'].deletePhoto(entityId, urlServerPath, photoId).subscribe({
      next: () => {
        this.toastr.success('Photo deleted');
      },
      error: () => this.toastr.error('Could not delete photo')
    });
  }

  // Método que elimina foto y actualiza entidad usando GenericPhotoService
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
