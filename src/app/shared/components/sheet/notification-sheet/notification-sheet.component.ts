import { Component, Inject, inject } from "@angular/core";
import {MatListModule} from '@angular/material/list';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetModule,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { MatButtonModule } from "@angular/material/button";
import { UserNotification } from "src/app/core/_models/userNotification";
import { NotificationService } from "src/app/core/_services/notification.service";

@Component({
    selector: 'app-notification-sheet',
    templateUrl: 'notification-sheet.component.html',
    styleUrls: ['./notification-sheet.component.css'],
    imports: [MatButtonModule, MatBottomSheetModule, MatListModule],
  })
  export class NotificationSheetComponent {
    private _bottomSheetRef =
      inject<MatBottomSheetRef<NotificationSheetComponent>>(MatBottomSheetRef);

    private notificationService = inject(NotificationService); 

  
    constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: {username: string, assignedNotifications: UserNotification[]}) {      
    }

    openLink(event: MouseEvent): void {
      this._bottomSheetRef.dismiss();
      event.preventDefault();
    }

    deleteNotification(id: number, username: string) {
      this.notificationService.deleteNotification(id, username).subscribe({
        next: () => {              
          this.data.assignedNotifications = this.data.assignedNotifications.filter(notification => notification.notification.id !== id);
        },
        error: (error) => {
          console.error('Error deleting notification:', error);
        }
      });
    }

    cancel() {
      this._bottomSheetRef.dismiss();
    }
  }