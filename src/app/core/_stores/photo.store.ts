import { Injectable, inject, signal, computed, effect } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { Member } from "../_models/member";
import { Photo } from "../_models/photo";
import { MembersService } from "../_services/members.service";
import { FileUploader } from "ng2-file-upload";
import { ImageItem } from "ng-gallery";
import { AccountService } from "../_services/account.service";
import { MemberStore } from "./member.store";
import { User } from "../_models/user";
import { BikeStore } from "./bike.store";

@Injectable({ providedIn: 'root' })
export class PhotoStore {
    
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

  uploader = signal<FileUploader | undefined>(undefined);

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

  deletePhoto(photoId: number) {
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
  }
}
