import { Photo } from './photo';

export interface PhotoEntity {
  photos: Photo[];
  photoUrl?: string;
}

export interface PhotoConfig<T> {
  photosProperty: keyof T;
  photoUrlProperty?: keyof T;
  getEntityIdentifier: (entity: T) => string;
}
