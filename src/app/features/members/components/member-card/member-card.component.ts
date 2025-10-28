import { Component, inject, input } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { ToastrModule } from 'ngx-toastr';
import { Member } from 'src/app/core/_models/member';
import { PresenceService } from 'src/app/core/_services/presence.service';
import { RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-member-card',
    templateUrl: './member-card.component.html',
    styleUrls: ['./member-card.component.css'],
  imports: [CommonModule, RouterModule, RouterLink, ToastrModule, TranslocoModule]
})
export class MemberCardComponent {
  public presenceService = inject(PresenceService );

  member = input<Member | undefined>();


}
