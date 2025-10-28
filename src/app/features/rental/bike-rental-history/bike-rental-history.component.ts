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
import { RentalHistoryCustomer } from 'src/app/core/_models/rentalHistoryCustomer';
import { BikeRentalHistory } from 'src/app/core/_models/bikeRentalHistory';
import { Bike } from '../../../core/_models/bike';
import { TranslocoService } from '@jsverse/transloco';


  function getBikeRentalHistoryColumns(transloco: TranslocoService): TableColumn<RentalHistoryCustomer>[] {
    return [
      {
        columnDef: 'photoUrl',
        header: 'Photo',
        cell: (row: RentalHistoryCustomer) => row.photoUrl,
        isCustomRender: true,
      },
      {
        columnDef: 'username',
        header: 'Username',
        cell: (row: RentalHistoryCustomer) => row.username,
      },
      {
        columnDef: 'name',
        header: 'Name',
        cell: (row: RentalHistoryCustomer) => row.name,
      },
      {
        columnDef: 'surname',
        header: 'Surname',
        cell: (row: RentalHistoryCustomer) => row.surname,
      },
      {
        columnDef: 'startDate',
        header: 'Start Date',
        cell: (row: RentalHistoryCustomer) => row.endDate ? new Date(row.startDate).toLocaleString('de-DE') : '',
      },
      {
        columnDef: 'endDate',
        header: 'End Date',
        cell: (row: RentalHistoryCustomer) => row.endDate ? new Date(row.endDate).toLocaleString('de-DE') : '',
      }
    ];
}

@Component({
  selector: 'app-bike-rental-history',
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
  templateUrl: './bike-rental-history.component.html',
  styleUrl: './bike-rental-history.component.css',
})
export class BikeRentalHistoryComponent {
  private rentalService = inject(RentService);

  readonly rentalStore = inject(RentStore);
  readonly transloco = inject(TranslocoService);

  user = this.rentalStore.user;
  bike = this.rentalStore.bike;

  serviceApiUrl = computed(() => {
    const bikeId = this.bike()?.id;
    return bikeId ? `rental/bike/${bikeId}` : '';
  });

  params = new Params();
  pagination = this.rentalStore.pagination;

  columns: TableColumn<RentalHistoryCustomer>[] = getBikeRentalHistoryColumns(this.transloco);

  defaultColDef = {
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 200,
  };

  dataSource = this.rentalStore.bikeRentalHistory;

  ngOnInit(): void {
    this.rentalStore.loadRentalsByBike(this.rentalStore.bike()!.id);
  }

  public refresh(bikeRentals: BikeRentalHistory) {
    this.dataSource();
  }
}
