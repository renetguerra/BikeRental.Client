import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-roles-modal',
    templateUrl: './roles-modal.component.html',
    styleUrls: ['./roles-modal.component.css'],
    imports: [FormsModule]
})
export class RolesModalComponent {
  username = '';
  availableRoles: any[] = [];
  selectedRoles: any[] = [];

  constructor(public bsModalRef: BsModalRef) { }

  updateChecked(checkedValue: string) {
    const index = this.selectedRoles.indexOf(checkedValue);
    index !== -1 ? this.selectedRoles.splice(index, 1) : this.selectedRoles.push(checkedValue);
  }

}
