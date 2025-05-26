import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { MemberStore } from 'src/app/core/_stores/member.store';
import { BikeCardComponent } from '../../components/bike-card/bike-card.component';
import { Bike } from 'src/app/core/_models/bike';
import { BikeStore } from 'src/app/core/_stores/bike.store';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
    selector: 'app-bike-list',
    templateUrl: './bike-list.component.html',
    styleUrls: ['./bike-list.component.css'],
    imports: [CommonModule, RouterModule, FormsModule, BikeCardComponent, NgxPaginationModule, MatSlideToggleModule]
})
export class BikeListComponent {  
  
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

  ngOnInit(): void {
    this.bikeStore.loadBikes();    
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
