import { Component, HostListener, OnInit, inject, signal, viewChild } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Member } from 'src/app/core/_models/member';
import { Photo } from 'src/app/core/_models/photo';
import { AccountService } from 'src/app/core/_services/account.service';
import { TimeagoModule } from 'ngx-timeago';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { DatePipe } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GalleryModule } from 'ng-gallery';
import { MemberStore } from 'src/app/core/_stores/member.store';
import { PhotoStore } from 'src/app/core/_stores/photo.store';
// import { PhotoEditorComponent } from '../../components/member-photo/photo-editor/photo-editor.component';
// import { PhotoDeleteComponent } from '../../components/member-photo/photo-delete/photo-delete.component';
import { PhotoEditorComponent } from 'src/app/shared/components/photo-editor/photo-editor.component';
import { PhotoDeleteComponent } from 'src/app/shared/components/photo-delete/photo-delete.component';

@Component({
    selector: 'app-member-edit',
    templateUrl: './member-edit.component.html',
    styleUrls: ['./member-edit.component.css'],
    imports: [TabsModule, FormsModule, DatePipe, TimeagoModule, GalleryModule,
      MatDialogModule, MatIconModule, MatButtonModule,
    ]
})
export class MemberEditComponent implements OnInit  {

  private accountService = inject(AccountService);
  private toastr = inject(ToastrService);
  readonly dialog = inject(MatDialog);

  private memberStore = inject(MemberStore);
  private photoStore = inject(PhotoStore);

  editForm = viewChild<NgForm>('editForm');
  @HostListener('window:beforeunload', ['$event']) unloadNotification($event: any) {
    if (this.editForm()?.dirty) {
      $event.returnValue = true;
    }
  }

  user = this.memberStore.user; //this.accountService.currentUser();
  member = this.memberStore.member;
  userNameParam = signal<string>('');

  galleryImages = this.photoStore.galleryImages;

  ngOnInit(): void {
    const currentMember = this.member();

    if (!currentMember || currentMember.id === 0) {
      this.userNameParam.set(this.accountService.currentUser()!.username);
      const member = this.memberStore.memberByUsername();
      if (member) {
        this.memberStore.setMember(member);
      }
    }

    const memberValue = this.member();
    if (memberValue) {
      this.memberStore.setMember(memberValue);
    }
  }

  updateMember() {
    const formValue = this.editForm()?.value;
    if (!formValue) return;

    const current = this.member();
    if (!current) return;

    const updatedMember: Member = {
      ...current,
      ...formValue
    };

    this.memberStore.updateMember(updatedMember).subscribe({
      next: () => {
        this.toastr.success('Profile updated successfully');
        this.editForm()?.reset(updatedMember);
      }
    });
  }

  openDialogAddPhoto() {
    this.dialog.open(PhotoEditorComponent<Member>, {
      width: '800px',
      maxWidth: '90vw',
      height: 'auto',
      maxHeight: '80vh',
      panelClass: 'photo-editor-dialog',
      disableClose: true, // CRÍTICO: Evitar cierre automático
      hasBackdrop: true,
      backdropClass: 'photo-editor-backdrop',
      autoFocus: false,
      restoreFocus: false,
      data: {
        entity: this.member(),
        urlServerPath: 'user/add-photo/',
        photoConfig: {
          photosProperty: 'userPhotos',
          photoUrlProperty: 'photoUrl',
          getEntityIdentifier: (m: Member) => m.username
        },
        onPhotoAdded: (photo: Photo, updatedMember: Member) => {
          // Update the store with the new member data
          this.memberStore.setMember(updatedMember);
        },
        onPhotoDeleted: (photoId: number, updatedMember: Member) => {
          // Update the store with the updated member data
          this.memberStore.setMember(updatedMember);
        },
        onMainPhotoSet: (photo: Photo, updatedMember: Member) => {
          // Update the store and current user if needed
          this.memberStore.setMember(updatedMember);
          const currentUser = this.accountService.currentUser();
          if (currentUser) {
            this.accountService.setCurrentUser({
              ...currentUser,
              photoUrl: photo.url
            });
          }
        }
      }
    });
  }

  openDialogDeletePhoto() {
    this.dialog.open(PhotoDeleteComponent<Member>, {
      data: {
        entity: this.member(),
        urlServerPath: 'user/delete-photo/',
        photoConfig: {
          photosProperty: 'userPhotos',
          photoUrlProperty: 'photoUrl',
          getEntityIdentifier: (m: Member) => m.username
        },
        onPhotoDeleted: (photoId: number, updatedMember: Member) => {
          // Update the store with the updated member data
          this.memberStore.setMember(updatedMember);
        },
        onMainPhotoSet: (photo: Photo, updatedMember: Member) => {
          // Update the store and current user if needed
          this.memberStore.setMember(updatedMember);
          const currentUser = this.accountService.currentUser();
          if (currentUser) {
            this.accountService.setCurrentUser({
              ...currentUser,
              photoUrl: photo.url
            });
          }
        }
      }
    });
  }

  updatePersonalInfo() {
    const formValue = this.editForm()?.value;
    if (!formValue) return;

    const current = this.member();
    if (!current) return;

    // Update only personal information fields
    const updatedMember: Member = {
      ...current,
      knownAs: formValue.knownAs || current.knownAs,
      surname: formValue.surname || current.surname,
      email: formValue.email || current.email,
      introduction: formValue.introduction || current.introduction
    };

    this.memberStore.updateMember(updatedMember).subscribe({
      next: () => {
        this.toastr.success('Información personal actualizada correctamente');
        this.editForm()?.reset(updatedMember);
      }
    });
  }

  updateLocationInfo() {
    const formValue = this.editForm()?.value;
    if (!formValue) return;

    const current = this.member();
    if (!current || !current.address) return;

    // Update only location information fields
    const updatedMember: Member = {
      ...current,
      address: {
        ...current.address,
        street: formValue.street || current.address.street,
        houseNumber: formValue.houseNumber || current.address.houseNumber,
        zip: formValue.zip || current.address.zip,
        city: formValue.city || current.address.city,
        country: formValue.country || current.address.country
      }
    };

    this.memberStore.updateMember(updatedMember).subscribe({
      next: () => {
        this.toastr.success('Información de ubicación confirmada correctamente');
        this.editForm()?.reset(updatedMember);
      }
    });
  }

  updateBankingInfo() {
    const formValue = this.editForm()?.value;
    if (!formValue) return;

    const current = this.member();
    if (!current) return;

    // Update only banking information fields
    const updatedMember: Member = {
      ...current,
      cardNumber: formValue.cardNumber || current.cardNumber,
      cardHolderName: formValue.cardholderName || current.cardHolderName,
      expiryDate: formValue.expiryDate || current.expiryDate,
      bankName: formValue.bankName || current.bankName,
      accountNumber: formValue.accountNumber || current.accountNumber,
      routingNumber: formValue.routingNumber || current.routingNumber
    };

    this.memberStore.updateMember(updatedMember).subscribe({
      next: () => {
        this.toastr.success('Datos bancarios confirmados correctamente');
        this.editForm()?.reset(updatedMember);
      }
    });
  }

  resetForm() {
    this.editForm()?.reset(this.member());
  }
}
