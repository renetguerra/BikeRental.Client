import { AfterViewInit, Component, computed, effect, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { User } from 'src/app/core/_models/user';
import { AdminService } from 'src/app/core/_services/admin.service';
import { AdminUserStore } from 'src/app/core/_stores/adminUser.store';
import { RolesModalComponent } from 'src/app/shared/components/modals/roles-modal/roles-modal.component';
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
    cell: (row: Bike) => row.photoUrl,
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
    columnDef: 'isAvailable',
    header: 'Available',
    cell: (row: Bike) => row.isAvailable ? 'Yes' : 'No',
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
    getEntityIdentifier: (b: Bike) => b.id.toString()
  };
    public bikePhotoUrlServerPath: string = 'bike/add-photo';

  private adminUserStore = inject(AdminUserStore);
  readonly bikeStore = inject(BikeStore);


  users = this.adminUserStore.users;

  user = this.bikeStore.user;
  bike = this.bikeStore.bike;

  serviceApiUrl = computed(() => {
    const bikeId = this.bike()?.id;
    return bikeId ? `bikes/${bikeId}` : '';
  });

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


}
