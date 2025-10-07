import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TimeagoModule } from 'ngx-timeago';
import { Member } from 'src/app/core/_models/member';
import { PresenceService } from 'src/app/core/_services/presence.service';
import { AccountService } from 'src/app/core/_services/account.service';
import { GalleryModule } from 'ng-gallery';
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
    imports: [CommonModule, GalleryModule, TimeagoModule,
        CustomerRentalHistoryComponent, BikeFavoriteComponent,
        MatDialogModule, MatIconModule, MatButtonModule, MatDividerModule]
})
export class MemberDetailComponent {

  private accountService = inject(AccountService);
  public presenceService = inject(PresenceService);
  private _bottomSheet = inject(MatBottomSheet);
  readonly dialog = inject(MatDialog);

  private memberStore = inject(MemberStore);
  private photoStore = inject(PhotoStore);

  readonly user = signal(this.accountService.currentUser());
  member = this.memberStore.member;
  members = this.memberStore.members;

  activeTab = signal<string>('info');
  userNameParam = signal<string>('');
  showFullCard = signal<boolean>(false);

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
        params['tab'] && this.setActiveTab(params['tab'])
      }
    })
  }

  setMember(member: Member) {
    this.memberStore.setMember(member);
  }

  setActiveTab(tab: string) {
    this.activeTab.set(tab);
  }

  toggleCardNumber() {
    this.showFullCard.update(current => !current);
  }

  getCardNumber(): string {
    return this.showFullCard() ? '4532 1234 5678 9012' : '**** **** **** 1234';
  }

  getFullAddress(): string {
    const address = this.member()?.address;
    if (!address) return 'No especificado';

    const parts = [
      address.street,
      address.houseNumber,
      address.city,
      address.country
    ].filter(part => part && part.trim() !== '');

    return parts.length > 0 ? parts.join(', ') : 'No especificado';
  }

  openDialogAddPhoto() {
    this.dialog.open(PhotoEditorComponent<Member>, {
      data: {
        entity: this.member(),
        urlServerPath: 'user/add-photo/',
        getEntityIdentifier: (m: Member) => m.username
      }
    });
  }

  openDialogDeletePhoto() {
    this.dialog.open(PhotoDeleteComponent<Member>, {
      data: {
        entity: this.member(),
        getEntityIdentifier: (m: Member) => m.username
      }
    });
  }

}
