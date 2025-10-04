import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { Photo } from "../_models/photo";

type EntityType = 'user' | 'bike';

@Injectable({ providedIn: 'root' })
export class PhotoService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  uploadPhoto(entityId: string, uploadPath: string, formData: FormData, token: string) {
    return this.http.post<Photo>(`${this.baseUrl}${uploadPath}/${entityId}/photos`, formData, {
      headers: { Authorization: `Bearer ${token}` },
      observe: 'events',
      reportProgress: true
    });
  }

  setMainPhoto(entityId: string, uploadPath: string, photoId: number) {
    return this.http.put(`${this.baseUrl}${uploadPath}/${entityId}/set-main-photo/${photoId}`, {});
  }

  deletePhoto(entityType: EntityType, entityId: string, photoId: number) {
    return this.http.delete(
      `${this.baseUrl}${entityType}/delete-photo/${entityId}?photoId=${photoId}`
    );
  }
}
