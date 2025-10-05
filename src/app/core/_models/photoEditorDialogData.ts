import { Photo } from './photo';
import { PhotoConfig } from './genericPhotoConfig';

export interface PhotoEditorDialogData<T> {
  entity: T;
  urlServerPath: string;
  photoConfig: PhotoConfig<T>;
  onPhotoAdded?: (photo: Photo, updatedEntity: T) => void;
  onPhotoDeleted?: (photoId: number, updatedEntity: T) => void;
  onMainPhotoSet?: (photo: Photo, updatedEntity: T) => void;
}
