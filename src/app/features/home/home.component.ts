import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { RegisterComponent } from '../register/register.component';
import { GalleryModule, ImageItem } from 'ng-gallery';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from 'rxjs';
import { PhotoStore } from 'src/app/core/_stores/photo.store';
import { AccountService } from 'src/app/core/_services/account.service';
import { MemberStore } from 'src/app/core/_stores/member.store';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    imports: [RegisterComponent, GalleryModule, MatButtonModule, MatDialogModule, MatIconModule,
      TranslocoModule]
})
export class HomeComponent {
  private accountService = inject(AccountService);
  private router = inject(Router);
  readonly dialog = inject(MatDialog);

  readonly memberStore = inject(MemberStore);

  user = this.memberStore.user;

  private readonly refreshTrigger = new Subject<void>();

  registerMode = false;

  /**
   * Toggle registration mode on/off
   */
  registerToggle() {
    this.registerMode = !this.registerMode;
  }

  /**
   * Cancel registration mode (called from register component)
   */
  cancelRegisterMode(event?: boolean) {
    this.registerMode = event ?? false;
  }

  /**
   * Navigate to bikes list page
   */
  navigateToBikes() {
    this.router.navigate(['/bikes']);
  }
}
