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
import { TranslocoService } from '@jsverse/transloco';

function getBikeFavoriteColumns(transloco: TranslocoService): TableColumn<BikeFavorite>[] {
  return [
    {
      columnDef: 'photoUrl',
      header: transloco.translate('bikeFavorite.photo'),
      cell: (row: BikeFavorite) => row.photoUrl,
      isCustomRender: true,
    },
    {
      columnDef: 'model',
      header: transloco.translate('bikeFavorite.model'),
      cell: (row: BikeFavorite) => row.model,
    },
    {
      columnDef: 'brand',
      header: transloco.translate('bikeFavorite.brand'),
      cell: (row: BikeFavorite) => row.brand,
    },
    {
      columnDef: 'type',
      header: transloco.translate('bikeFavorite.type'),
      cell: (row: BikeFavorite) => row.type,
    },
    {
      columnDef: 'year',
      header: transloco.translate('bikeFavorite.year'),
      cell: (row: BikeFavorite) => row.year,
    },
    {
      columnDef: 'isAvailable',
      header: transloco.translate('bikeFavorite.available'),
      cell: (row: BikeFavorite) => row.isAvailable ? transloco.translate('bikeFavorite.yes') : transloco.translate('bikeFavorite.no'),
    }
  ];
}

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
  readonly likeStore = inject(LikeStore);
  readonly transloco = inject(TranslocoService);

  user = this.likeStore.user;
  bike = this.likeStore.bike;

  serviceApiUrl = computed(() => {
    const bikeId = this.bike()?.id;
    return bikeId ? `likes/${bikeId}` : '';
  });

  params = new Params();
  pagination = this.likeStore.pagination;
  columns: TableColumn<BikeFavorite>[] = getBikeFavoriteColumns(this.transloco);

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
