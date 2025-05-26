import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { MemberStore } from 'src/app/core/_stores/member.store';
import { MemberCardComponent } from '../../components/member-card/member-card.component';

@Component({
    selector: 'app-member-list',
    templateUrl: './member-list.component.html',
    styleUrls: ['./member-list.component.css'],
    imports: [CommonModule, RouterModule, FormsModule, MemberCardComponent, NgxPaginationModule]
})
export class MemberListComponent {  
  
  private memberStore = inject(MemberStore);
  
  members = this.memberStore.members;
  pagination = this.memberStore.pagination;
  userParams = this.memberStore.userParams;
  genderList = [
    { value: 'male', display: 'Males' }, 
    { value: 'female', display: 'Females' }
  ];

  ngOnInit(): void {
    this.memberStore.loadMembers();
  }

  applyFilters() {
    const params = this.userParams();
    if (params) {
      this.memberStore.setUserParams(params);
    }
  }

  setOrderBy(order: string) {
    const params = structuredClone(this.userParams());
    if (params) {
      params.orderBy = order;
      this.memberStore.setUserParams(params);
    }
  } 

  resetFilters() {
    this.memberStore.resetFilters();    
  }
 
  pageChanged(event: any) {    
    this.memberStore.changePage(event.page);
  }
}
