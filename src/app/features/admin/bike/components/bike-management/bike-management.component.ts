import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdminUserStore } from 'src/app/core/_stores/adminUser.store';
import { BikeStore } from 'src/app/core/_stores/bike.store';
import { Params } from 'src/app/core/_models/params';
import { Bike } from 'src/app/core/_models/bike';
import { TableColumn } from 'src/app/core/_models/generic';
import { CrudTableComponent } from 'src/app/shared/components/table/crud/crud-table.component';
import { PhotoConfig } from 'src/app/core/_models/genericPhotoConfig';

const BIKEFAVORITE_COLUMNS: TableColumn<Bike>[] = [
  {
    columnDef: 'photoUrl',
    header: 'Photo',
    cell: (row: Bike) => row.photoUrl ?? 'assets/placeholder-bike.png',
    isCustomRender: true,
  },
  {
    columnDef: 'model',
    header: 'Model',
    cell: (row: Bike) => row.model,
  },
  {
    columnDef: 'brand',
    header: 'Brand',
    cell: (row: Bike) => row.brand,
  },
  {
    columnDef: 'type',
    header: 'Type',
    cell: (row: Bike) => row.type,
  },
  {
    columnDef: 'year',
    header: 'Year',
    cell: (row: Bike) => row.year,
  },
  {
    columnDef: 'price',
    header: 'Price',
    cell: (row: Bike) => row.price,
  },
  {
    columnDef: 'isAvailable',
    header: 'Available',
    cell: (row: Bike) => row.isAvailable,
  }
];

@Component({
  selector: 'app-bike-management',
  standalone: true,
  templateUrl: './bike-management.component.html',
  styleUrls: ['./bike-management.component.css'],
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    CrudTableComponent
  ]
})
export class BikeManagementComponent implements OnInit {
  public bikePhotoConfig: PhotoConfig<Bike> = {
    photosProperty: 'bikePhotos',
    photoUrlProperty: 'photoUrl',
    getEntityIdentifier: (b: Bike) => {
      if (!b || typeof b.id === 'undefined' || b.id === null) {
        return '';
      }
      return b.id.toString();
    }
  };

  public bikePhotoUrlServerPath = 'bike/add-photo/';

  private adminUserStore = inject(AdminUserStore);
  readonly bikeStore = inject(BikeStore);


  users = this.adminUserStore.users;

  user = this.bikeStore.user;
  bike = this.bikeStore.bike;

  params = new Params();
  pagination = this.bikeStore.pagination;

  columns = BIKEFAVORITE_COLUMNS;

  defaultColDef = {
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 200,
  };

  dataSource = this.bikeStore.bikes;


  ngOnInit(): void {
    this.bikeStore.loadBikes();
  }

  public refresh(bikeFavorites: Bike[]) {
    this.dataSource;
  }

  pageChanged(event: any) {
    this.bikeStore.changePage(event.page);
  }

  getApiUrl(action: string, bike?: Bike): string {
    if (action === 'create') return 'bike/create';
    if (action === 'update') return 'bike/update';
    if (action === 'delete' && bike?.id) return `bike/remove-bike/${bike.id}`;
    return '';
  }


}
