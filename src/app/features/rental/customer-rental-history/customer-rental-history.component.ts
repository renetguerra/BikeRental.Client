import { Component, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableColumn } from 'src/app/core/_models/generic';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { Params } from 'src/app/core/_models/params';
import { RentalHistory } from 'src/app/core/_models/rentalHistory';
import { RentService } from 'src/app/core/_services/rent.service';
import { RentStore } from 'src/app/core/_stores/rent.store';
import { CustomerRentalHistory } from 'src/app/core/_models/customerRentalHistory';
import { CommonTableComponent } from 'src/app/shared/components/table/common/common-table.component';

const RENTALHISTORY_COLUMNS: TableColumn<RentalHistory>[] = [
  {
    columnDef: 'photoUrl',
    header: 'Photo',
    cell: (row: RentalHistory) => row.photoUrl,
    isCustomRender: true, // aquí indicas que esa columna tiene template propio
  },
  {
    columnDef: 'model',
    header: 'Model',
    cell: (row: RentalHistory) => row.modelBike,
  },
  {
    columnDef: 'brand',
    header: 'Brand',
    cell: (row: RentalHistory) => row.brandBike,
  },
  {
    columnDef: 'priceBike',
    header: 'Price',
    cell: (row: RentalHistory) =>
      row.priceBike ? row.priceBike.toFixed(2) + ' €' : '',
  },
  {
    columnDef: 'startDate',
    header: 'Start Date',
    cell: (row: RentalHistory) => row.startDate ? new Date(row.startDate).toLocaleString('de-DE') : '',
  },
  {
    columnDef: 'endDate',
    header: 'End Date',
    cell: (row: RentalHistory) => row.endDate ? new Date(row.endDate).toLocaleString('de-DE') : '',
  }
];

@Component({
  selector: 'app-customer-rental-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TabsModule,    
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    CommonTableComponent,
  ],
  templateUrl: './customer-rental-history.component.html',
  styleUrl: './customer-rental-history.component.css',
})
export class CustomerRentalHistoryComponent {
  private rentalService = inject(RentService);
  
  readonly rentalStore = inject(RentStore);

  user = this.rentalStore.user;

  serviceApiUrl = computed(() => {
    const username = this.user()?.username;
    return username ? `rental/customer/${username}/history` : '';
  });

  params = new Params();
  pagination = this.rentalStore.pagination;

  columns = RENTALHISTORY_COLUMNS;  

  defaultColDef = {
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 200,
  };

  dataSource = this.rentalStore.customerRentalHistory;

  ngOnInit(): void {
    this.rentalStore.loadCustomerRentals(this.rentalStore.user()!.username);   
  }

  public refresh(customerRentals: CustomerRentalHistory) {
    this.dataSource();
  }
}
