import { Injectable, inject } from '@angular/core';
import { Observable, of, EMPTY } from 'rxjs';
import { tap, map, filter } from 'rxjs/operators';
import { HttpEventType } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { PhotoService } from './photo.service';
import { Photo } from '../_models/photo';
import { PhotoConfig } from '../_models/genericPhotoConfig';
import { AccountService } from './account.service';
import { MemberStore } from '../_stores/member.store';

/**
 * GenericPhotoService - Servicio completamente genérico para manejo de fotos
 *
 * Este servicio funciona con CUALQUIER entidad sin necesidad de crear estrategias específicas.
 *
 * Ejemplo de uso:
 *
 * // Para Member
 * photoConfig: {
 *   photosProperty: 'userPhotos',
 *   photoUrlProperty: 'photoUrl',
 *   getEntityIdentifier: (m: Member) => m.username
 * }
 *
 * // Para Bike
 * photoConfig: {
 *   photosProperty: 'bikePhotos',
 *   photoUrlProperty: 'photoUrl',
 *   getEntityIdentifier: (b: Bike) => b.id.toString()
 * }
 *
 * // Para CUALQUIER nueva entidad (ej: Moto)
 * photoConfig: {
 *   photosProperty: 'fotos',           // ← nombre de la propiedad de fotos
 *   photoUrlProperty: 'imagenPrincipal', // ← nombre de la imagen principal
 *   getEntityIdentifier: (m: Moto) => m.id.toString()
 * }
 */
@Injectable({ providedIn: 'root' })
export class GenericPhotoService {
  private photoService = inject(PhotoService);
  private memberStore = inject(MemberStore);
  private toastr = inject(ToastrService);

  uploadPhoto<T>(
    entity: T,
    photoConfig: PhotoConfig<T>,
    urlServerPath: string,
    file: File,
    token: string,
    onSuccess?: (photo: Photo, updatedEntity: T) => void
  ): Observable<{ photo: Photo; updatedEntity: T }> {
    const entityId = photoConfig.getEntityIdentifier(entity);
    const formData = new FormData();
    formData.append('file', file);

    return this.photoService.uploadPhoto(entityId, urlServerPath, formData, token).pipe(
      map(event => {
        if (event.type === HttpEventType.Response) {
          const photo = event.body as Photo;
          const updatedEntity = this.addPhotoToEntity(entity, photo, photoConfig);

          if (onSuccess) {
            onSuccess(photo, updatedEntity);
          }

          this.toastr.success('Photo uploaded');
          return { photo, updatedEntity };
        }
        return null;
      }),
      filter((result): result is { photo: Photo; updatedEntity: T } => result !== null)
    );
  }

  setMainPhoto<T>(
    entity: T,
    photoConfig: PhotoConfig<T>,
    urlServerPath: string,
    photo: Photo,
    onSuccess?: (photo: Photo, updatedEntity: T) => void
  ): Observable<{ photo: Photo; updatedEntity: T }> {
    const entityId = photoConfig.getEntityIdentifier(entity);

    return this.photoService.setMainPhoto(entityId, urlServerPath, photo.id).pipe(
      map(() => {
        const updatedEntity = this.setMainPhotoForEntity(entity, photo, photoConfig);

        if (onSuccess) {
          onSuccess(photo, updatedEntity);
        }
        return { photo, updatedEntity };
      })
    );
  }

  deletePhoto<T>(
    entity: T,
    photoConfig: PhotoConfig<T>,
    urlServerPath: string,
    photoId: number,
    onSuccess?: (photoId: number, updatedEntity: T) => void
  ): Observable<{ photoId: number; updatedEntity: T }> {
    const entityId = photoConfig.getEntityIdentifier(entity);

    return this.photoService.deletePhoto(entityId, urlServerPath,  photoId).pipe(
      map(() => {
        const updatedEntity = this.deletePhotoFromEntity(entity, photoId, photoConfig);

        if (onSuccess) {
          onSuccess(photoId, updatedEntity);
        }

        return { photoId, updatedEntity };
      })
    );
  }

  getPhotos<T>(entity: T, photoConfig: PhotoConfig<T>): Photo[] {
    return (entity as any)[photoConfig.photosProperty] || [];
  }

  // Métodos privados para manipular entidades genéricamente
  private addPhotoToEntity<T>(entity: T, photo: Photo, config: PhotoConfig<T>): T {
    const currentPhotos = this.getPhotos(entity, config);
    const updatedPhotos = [...currentPhotos, photo];

    return {
      ...entity,
      [config.photosProperty]: updatedPhotos
    };
  }

  private setMainPhotoForEntity<T>(entity: T, photo: Photo, config: PhotoConfig<T>): T {
    const currentPhotos = this.getPhotos(entity, config);
    const updatedPhotos = currentPhotos.map(p => ({ ...p, isMain: p.id === photo.id }));

    const updateData: any = {
      ...entity,
      [config.photosProperty]: updatedPhotos
    };

    // Actualizar photoUrl si está configurado
    if (config.photoUrlProperty) {
      updateData[config.photoUrlProperty] = photo.url;
    }

    return updateData;
  }

  private deletePhotoFromEntity<T>(entity: T, photoId: number, config: PhotoConfig<T>): T {
    const currentPhotos = this.getPhotos(entity, config);
    const updatedPhotos = currentPhotos.filter(p => p.id !== photoId);

    return {
      ...entity,
      [config.photosProperty]: updatedPhotos
    };
  }
}
