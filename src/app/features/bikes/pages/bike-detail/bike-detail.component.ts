import { CommonModule } from '@angular/common';
import { Component, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TabDirective, TabsModule, TabsetComponent } from 'ngx-bootstrap/tabs';
import { TimeagoModule } from 'ngx-timeago';
import { PresenceService } from 'src/app/core/_services/presence.service';
import { AccountService } from 'src/app/core/_services/account.service';
import { GalleryModule } from 'ng-gallery';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { PhotoStore } from 'src/app/core/_stores/photo.store';
import {MatDividerModule} from '@angular/material/divider';
import { BikeStore } from 'src/app/core/_stores/bike.store';
import { Bike } from 'src/app/core/_models/bike';
import { PhotoEditorComponent } from 'src/app/shared/components/photo-editor/photo-editor.component';
import { PhotoDeleteComponent } from 'src/app/shared/components/photo-delete/photo-delete.component';
import { BikeRentalHistoryComponent } from 'src/app/features/rental/bike-rental-history/bike-rental-history.component';
import { RentStore } from 'src/app/core/_stores/rent.store';

@Component({
    selector: 'app-bike-detail',
    templateUrl: './bike-detail.component.html',
    styleUrls: ['./bike-detail.component.css'],
    imports: [CommonModule, TabsModule, GalleryModule, TimeagoModule, 
        BikeRentalHistoryComponent, 
        MatDialogModule, MatIconModule, MatButtonModule, MatDividerModule]
})
export class BikeDetailComponent {  
  
  bikeTabs = viewChild<TabsetComponent>('bikeTabs');  

  private accountService = inject(AccountService);      
  public presenceService = inject(PresenceService);      
  readonly dialog = inject(MatDialog);

  private bikeStore = inject(BikeStore);  
  public rentStore = inject(RentStore);
  private photoStore = inject(PhotoStore);

  readonly user = signal(this.accountService.currentUser());  
  bike = this.bikeStore.bike;
  bikes = this.bikeStore.bikes;

  activeTab?: TabDirective;  
  
  userNameParam = signal<string>('');
    
  galleryImages = this.photoStore.galleryBikeImages; 

  readonly bikeById = this.bikeStore.bikeById;    
  
  constructor(private router: Router, private route: ActivatedRoute) {
    this.user.set(this.accountService.currentUser()!);
    const bikeValue = this.bike();
    if (bikeValue) {
      this.bikeStore.setBike(bikeValue);
    }
  }

  ngOnInit(): void {    

    this.route.data.subscribe({
      next: data => this.bikeStore.setBike(data['bike'])
    })

    this.route.queryParams.subscribe({
      next: params => {
        params['tab'] && this.selectTab(params['tab'])
      }
    })        
  }  

  setBike(bike: Bike) {
    this.bikeStore.setBike(bike);
  }  

  selectTab(heading: string) {
    if (this.bikeTabs()) {
      this.bikeTabs()!.tabs.find(x => x.heading === heading)!.active = true;
    }
  }  

  onTabActivated(data: TabDirective) {
    this.activeTab = data;        
  }
  
  openDialogAddPhoto() {       
    this.dialog.open(PhotoEditorComponent<Bike>, {
      data: {
        entity: this.bike(),
        uploadPath: 'bike/add-photo',
        getEntityIdentifier: (b: Bike) => b.id.toString()       
      }
    });
  }
  
  openDialogDeletePhoto() {             
    this.dialog.open(PhotoDeleteComponent<Bike>, {
      data: {
        entity: this.bike(),
        getEntityIdentifier: (b: Bike) => b.id.toString()
      }
    });         
  }

  rentBike() {
    if (!this.bike()) return;
    this.rentStore.rentBike(this.bike()!.id).subscribe({
      next: (response) => {
        console.log('OK', response);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

}
