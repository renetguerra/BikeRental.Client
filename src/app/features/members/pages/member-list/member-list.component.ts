import { Component, inject, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MemberStore } from 'src/app/core/_stores/member.store';
import { MemberCardComponent } from '../../components/member-card/member-card.component';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
    selector: 'app-member-list',
    templateUrl: './member-list.component.html',
    styleUrls: ['./member-list.component.css'],
    imports: [CommonModule, RouterModule, FormsModule, MemberCardComponent,
      MatPaginatorModule, ButtonsModule, TranslocoModule]
})
export class MemberListComponent implements OnInit, AfterViewInit {

  private memberStore = inject(MemberStore);

  members = this.memberStore.members;
  pagination = this.memberStore.pagination;
  userParams = this.memberStore.userParams;
  genderList = [
    { value: 'male', display: 'Males' },
    { value: 'female', display: 'Females' }
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.memberStore.loadMembers(true);
  }

  ngAfterViewInit() {
    this.paginator.page.subscribe(event => {
      const { pageIndex, pageSize } = event;
      this.memberStore.changePage(pageIndex + 1);
      this.memberStore.changePageSize(pageSize)
    });
  }

  onPageChanged(event: PageEvent) {
    this.memberStore.changePage(event.pageIndex + 1);
    this.memberStore.changePageSize(event.pageSize);
  }

  applyFilters() {
    const params = this.userParams();
    if (params) {
      this.memberStore.setUserParams(params);
    }
  }

  setOrderBy(order: string) {
    const params = this.userParams();
    if (params) {
      params.orderBy = order;
      this.memberStore.setUserParams(params);
    }
  }

  resetFilters() {
    this.memberStore.resetFilters();
  }
}
