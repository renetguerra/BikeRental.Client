import { Component, HostListener, OnInit, inject, signal, viewChild } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Member } from 'src/app/core/_models/member';
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
// import { PhotoEditorComponent } from '../../components/bike-photo/photo-editor/photo-editor.component';
// import { PhotoDeleteComponent } from '../../components/bike-photo/photo-delete/photo-delete.component';
import { PhotoEditorComponent } from 'src/app/shared/components/photo-editor/photo-editor.component';
import { BikeStore } from 'src/app/core/_stores/bike.store';
import { Bike } from 'src/app/core/_models/bike';
import { PhotoDeleteComponent } from 'src/app/shared/components/photo-delete/photo-delete.component';

@Component({
    selector: 'app-bike-edit',
    templateUrl: './bike-edit.component.html',
    styleUrls: ['./bike-edit.component.css'],
    imports: [TabsModule, FormsModule, DatePipe, TimeagoModule, GalleryModule,
      MatDialogModule, MatIconModule, MatButtonModule,
    ]
})
export class BikeEditComponent implements OnInit  {

  private accountService = inject(AccountService);  
  private toastr = inject(ToastrService);
  readonly dialog = inject(MatDialog);

  private bikeStore = inject(BikeStore);
  private photoStore = inject(PhotoStore);
  
  editForm = viewChild<NgForm>('editForm');
  @HostListener('window:beforeunload', ['$event']) unloadNotification($event: any) {
    if (this.editForm()?.dirty) {
      $event.returnValue = true;
    }
  }

  user = this.accountService.currentUser();
  bike = this.bikeStore.bike;  
  bikeIdParam = signal<number>(0);

  galleryImages = this.photoStore.galleryBikeImages;

  ngOnInit(): void {   
    // if (!this.bike()! || this.bike()!.id === 0) {
    //   this.bikeIdParam.set(this.route.snapshot.paramMap.get('id'));      
    //   const bike = this.bikeStore.bikeById();
    //   if (bike) {
    //     this.bikeStore.setBike(bike);
    //   }
    // }

    const bikeValue = this.bike();
    if (bikeValue) {
      this.bikeStore.setBike(bikeValue);
    }
  }

  updateBike() {
    const formValue = this.editForm()?.value;
    if (!formValue) return;

    const current = this.bike();
    if (!current) return;

    const updatedBike: Bike = {
      ...current,
      ...formValue      
    };

    this.bikeStore.updateBike(updatedBike).subscribe({
      next: () => {        
        this.toastr.success('Profile updated successfully');
        this.editForm()?.reset(updatedBike);
      }
    });
  }
  
  openDialogAddPhoto() {    
    // this.dialog.open(PhotoEditorComponent, {
    //   data: this.member()
    // });    

    this.dialog.open(PhotoEditorComponent<Bike>, {
      data: {
        entity: this.bike(),
        uploadPath: 'bike/add-photo',
        getEntityIdentifier: (b: Bike) => b.id.toString()        
      }
    });

  }
  
  openDialogDeletePhoto() {        
    // this.dialog.open(PhotoDeleteComponent, {
    //   data: this.bike()
    // });
    this.dialog.open(PhotoDeleteComponent<Bike>, {
      data: {
        entity: this.bike(),
        getEntityIdentifier: (b: Bike) => b.id.toString()
      }
    });            
  }
}