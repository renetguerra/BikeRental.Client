import { Component, computed, inject } from '@angular/core';
import { RegisterComponent } from '../register/register.component';
import { GalleryModule, ImageItem } from 'ng-gallery';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from 'rxjs';
import { PhotoStore } from 'src/app/core/_stores/photo.store';
import { AccountService } from 'src/app/core/_services/account.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    imports: [RegisterComponent, GalleryModule, MatButtonModule, MatDialogModule, MatIconModule]
})
export class HomeComponent {
  private accountService = inject(AccountService);  
  readonly dialog = inject(MatDialog);

  readonly photoStore = inject(PhotoStore);
  
  user = this.photoStore.user;  

  private readonly refreshTrigger = new Subject<void>();  
  
  registerMode = false;        

  registerToggle() {
    this.registerMode = !this.registerMode
  }

  cancelRegisterMode(event: boolean) {
    this.registerMode = event;
  }  

}
