import { CommonModule } from '@angular/common';
import { Component, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TabDirective, TabsModule, TabsetComponent } from 'ngx-bootstrap/tabs';
import { TimeagoModule } from 'ngx-timeago';
import { Member } from 'src/app/core/_models/member';
import { PresenceService } from 'src/app/core/_services/presence.service';
import { AccountService } from 'src/app/core/_services/account.service';
import { GalleryModule } from 'ng-gallery';
import { MemberListComponent } from '../member-list/member-list.component';
import { HasRoleDirective } from 'src/app/shared/_directives/has-role.directive';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MemberStore } from 'src/app/core/_stores/member.store';
import { PhotoStore } from 'src/app/core/_stores/photo.store';
import {MatDividerModule} from '@angular/material/divider';
import { PhotoEditorComponent } from 'src/app/shared/components/photo-editor/photo-editor.component';
import { PhotoDeleteComponent } from 'src/app/shared/components/photo-delete/photo-delete.component';
import { CustomerRentalHistoryComponent } from 'src/app/features/rental/customer-rental-history/customer-rental-history.component';
import { BikeFavoriteComponent } from 'src/app/features/like/bike-favorite/bike-favorite.component';

@Component({
    selector: 'app-member-detail',
    templateUrl: './member-detail.component.html',
    styleUrls: ['./member-detail.component.css'],
    imports: [CommonModule, TabsModule, GalleryModule, TimeagoModule, 
        MemberListComponent, CustomerRentalHistoryComponent, BikeFavoriteComponent,
        MatDialogModule, MatIconModule, MatButtonModule, MatDividerModule,
        HasRoleDirective]
})
export class MemberDetailComponent {  
  
  memberTabs = viewChild<TabsetComponent>('memberTabs');  

  private accountService = inject(AccountService);      
  public presenceService = inject(PresenceService);  
  private _bottomSheet = inject(MatBottomSheet);  
  readonly dialog = inject(MatDialog);

  private memberStore = inject(MemberStore);
  private photoStore = inject(PhotoStore);

  readonly user = signal(this.accountService.currentUser());  
  member = this.memberStore.member;
  members = this.memberStore.members;

  activeTab?: TabDirective;  
  
  userNameParam = signal<string>('');
    
  galleryImages = this.photoStore.galleryImages;
  
  readonly memberByUser = this.memberStore.memberByUsername;    
   
  constructor(private router: Router, private route: ActivatedRoute) {
    this.user.set(this.accountService.currentUser()!);
    const memberValue = this.member();
    if (memberValue) {
      this.memberStore.setMember(memberValue);
    }
  }

  ngOnInit(): void {    

    if (!this.member()! || this.member()!.id === 0) {
      this.userNameParam.set(this.route.snapshot.paramMap.get('username')!);      
      this.memberStore.memberByUsername();                              
    }

    this.route.data.subscribe({
      next: data => this.memberStore.setMember(data['member'])
    })

    this.route.queryParams.subscribe({
      next: params => {
        params['tab'] && this.selectTab(params['tab'])
      }
    })        
  }  

  setMember(member: Member) {
    this.memberStore.setMember(member);
  }  

  selectTab(heading: string) {
    if (this.memberTabs()) {
      this.memberTabs()!.tabs.find(x => x.heading === heading)!.active = true;
    }
  }

  onTabActivated(data: TabDirective) {
    this.activeTab = data;        
  }   
  
  openDialogAddPhoto() {    
    // this.dialog.open(PhotoEditorComponent, {
    //   data: this.member()
    // });    

    this.dialog.open(PhotoEditorComponent<Member>, {
      data: {
        entity: this.member(),
        uploadPath: 'user/add-photo',
        getEntityIdentifier: (m: Member) => m.username
      }
    });

  }
  
  openDialogDeletePhoto() {        
    // this.dialog.open(PhotoDeleteComponent, {
    //   data: this.member()
    // });            
    this.dialog.open(PhotoDeleteComponent<Member>, {
      data: {
        entity: this.member(),
        getEntityIdentifier: (m: Member) => m.username
      }
    });
  }

}
