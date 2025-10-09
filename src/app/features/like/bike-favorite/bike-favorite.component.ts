/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Component, computed, inject, OnInit } from '@angular/core';
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
import { CommonTableComponent } from 'src/app/shared/components/table/common/common-table.component';
import { BikeFavorite } from 'src/app/core/_models/bikeFavorite';
import { LikeStore } from 'src/app/core/_stores/like.store';
import { LikeService } from 'src/app/core/_services/like.service';

const BIKEFAVORITE_COLUMNS: TableColumn<BikeFavorite>[] = [
  {
    columnDef: 'photoUrl',
    header: 'Photo',
    cell: (row: BikeFavorite) => row.photoUrl,
    isCustomRender: true,
  },
  {
    columnDef: 'model',
    header: 'Model',
    cell: (row: BikeFavorite) => row.model,
  },
  {
    columnDef: 'brand',
    header: 'Brand',
    cell: (row: BikeFavorite) => row.brand,
  },
  {
    columnDef: 'type',
    header: 'Type',
    cell: (row: BikeFavorite) => row.type,
  },
  {
    columnDef: 'year',
    header: 'Year',
    cell: (row: BikeFavorite) => row.year,
  },
  {
    columnDef: 'isAvailable',
    header: 'Available',
    cell: (row: BikeFavorite) => row.isAvailable ? 'Yes' : 'No',
  }
];

@Component({
  selector: 'app-bike-favorite',
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
  templateUrl: './bike-favorite.component.html',
  styleUrl: './bike-favorite.component.css',
})
export class BikeFavoriteComponent implements OnInit {
  private likeService = inject(LikeService);

  readonly likeStore = inject(LikeStore);

  user = this.likeStore.user;
  bike = this.likeStore.bike;

  serviceApiUrl = computed(() => {
    const bikeId = this.bike()?.id;
    return bikeId ? `likes/${bikeId}` : '';
  });

  params = new Params();
  pagination = this.likeStore.pagination;

  columns = BIKEFAVORITE_COLUMNS;

  defaultColDef = {
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 200,
  };

  dataSource = this.likeStore.bikeFavorites;

  ngOnInit(): void {
    this.likeStore.loadBikeFavorites();
  }

  public refresh(bikeFavorites: BikeFavorite[]) {
    this.dataSource;
  }

  pageChanged(event: any) {
    this.likeStore.changePage(event.page);
  }
}
