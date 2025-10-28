import { Component, computed, effect, inject } from '@angular/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
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

function getRentalHistoryColumns(transloco: TranslocoService): TableColumn<RentalHistory>[] {
  return [
    {
      columnDef: 'photoUrl',
      header: transloco.translate('customerRentalHistory.photo'),
      cell: (row: RentalHistory) => row.photoUrl,
      isCustomRender: true,
    },
    {
      columnDef: 'model',
      header: transloco.translate('customerRentalHistory.model'),
      cell: (row: RentalHistory) => row.modelBike,
    },
    {
      columnDef: 'brand',
      header: transloco.translate('customerRentalHistory.brand'),
      cell: (row: RentalHistory) => row.brandBike,
    },
    {
      columnDef: 'priceBike',
      header: transloco.translate('customerRentalHistory.price'),
      cell: (row: RentalHistory) =>
        row.priceBike ? row.priceBike.toFixed(2) + ' €' : '',
    },
    {
      columnDef: 'startDate',
      header: transloco.translate('customerRentalHistory.startDate'),
      cell: (row: RentalHistory) => row.startDate ? new Date(row.startDate).toLocaleString('de-DE') : '',
    },
    {
      columnDef: 'endDate',
      header: transloco.translate('customerRentalHistory.endDate'),
      cell: (row: RentalHistory) => row.endDate ? new Date(row.endDate).toLocaleString('de-DE') : '',
    }
  ];
}

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
    TranslocoModule,
  ],
  templateUrl: './customer-rental-history.component.html',
  styleUrl: './customer-rental-history.component.css',
})
export class CustomerRentalHistoryComponent {
  private rentalService = inject(RentService);
  private transloco = inject(TranslocoService);

  readonly rentalStore = inject(RentStore);

  user = this.rentalStore.user;

  serviceApiUrl = computed(() => {
    const username = this.user()?.username;
    return username ? `rental/customer/${username}/history` : '';
  });

  params = new Params();
  pagination = this.rentalStore.pagination;

  columns: TableColumn<RentalHistory>[] = getRentalHistoryColumns(this.transloco);

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
