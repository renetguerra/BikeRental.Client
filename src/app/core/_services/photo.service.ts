import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { Photo } from "../_models/photo";

type EntityType = 'user' | 'bike';

@Injectable({ providedIn: 'root' })
export class PhotoService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  uploadPhoto(entityId: string, urlServerPath: string, formData: FormData, token: string) {
    return this.http.post<Photo>(`${this.baseUrl}${urlServerPath}${entityId}`, formData, {
      headers: { Authorization: `Bearer ${token}` },
      observe: 'events',
      reportProgress: true
    });
  }

  setMainPhoto(entityId: string, urlServerPath: string, photoId: number) {
    return this.http.put(`${this.baseUrl}${urlServerPath}${photoId}`, {});
  }

  deletePhoto(entityId: string, urlServerPath: string, photoId: number) {
    return this.http.delete(
      `${this.baseUrl}${urlServerPath}${entityId}/${photoId}`
    );
  }
}
