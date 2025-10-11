import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BikeCardComponent } from '../../components/bike-card/bike-card.component';
import { BikeStore } from 'src/app/core/_stores/bike.store';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { FocusTrapModule } from "ngx-bootstrap/focus-trap";
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
    selector: 'app-bike-list',
    templateUrl: './bike-list.component.html',
    styleUrls: ['./bike-list.component.css'],
    imports: [CommonModule, RouterModule, FormsModule, BikeCardComponent, MatPaginatorModule, MatSlideToggleModule, ButtonsModule, FocusTrapModule]
})
export class BikeListComponent implements OnInit, AfterViewInit {

  public bikeStore = inject(BikeStore);

  bikes = this.bikeStore.bikes;
  pagination = this.bikeStore.pagination;
  bikeParams = this.bikeStore.bikeParams;
  bikeYears = [
    { value: 2023 },
    { value: 2022 },
    { value: 2021 },
    { value: 2020 },
    { value: 2019 },
    { value: 2018 },
    { value: 2017 },
    { value: 2016 },
    { value: 2015 }
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.bikeStore.loadBikes();
  }

  ngAfterViewInit() {
    this.paginator.page.subscribe(event => {
      const { pageIndex, pageSize } = event;
      this.bikeStore.changePage(pageIndex + 1);
      this.bikeStore.changePageSize(pageSize);
    });
  }

  onPageChanged(event: PageEvent) {
    this.bikeStore.changePage(event.pageIndex + 1);
    this.bikeStore.changePageSize(event.pageSize);
  }

  applyFilters() {
    const params = this.bikeParams();
    if (params) {
      this.bikeStore.setBikeParams(params);
    }
  }

  setOrderBy(order: string) {
    const params = this.bikeParams();
    if (params) {
      params.orderBy = order;
      this.bikeStore.setBikeParams(params);
    }
  }

  resetFilters() {
    this.bikeStore.resetFilters();
  }

  pageChanged(event: any) {
    this.bikeStore.changePage(event.page);
  }
}
