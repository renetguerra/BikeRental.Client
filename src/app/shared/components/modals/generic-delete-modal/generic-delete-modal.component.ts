import { CommonModule } from '@angular/common';
import { Component, inject, input, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BsModalRef, ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { T } from '@angular/material/palette.d-f5ca9a2b';
import { TableColumn } from 'src/app/core/_models/generic';
import { AdminService } from 'src/app/core/_services/admin.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-generic-delete-modal',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,  
    FormsModule, ReactiveFormsModule, ModalModule, 
    TabsModule, 
    MatDialogModule, MatButtonModule     
  ],
  templateUrl: './generic-delete-modal.component.html',
  styleUrl: './generic-delete-modal.component.css'
})
export class GenericDeleteModalComponent {
  
  readonly columnsInput = input<TableColumn<T>[]>([]);   
  columns = signal<TableColumn<T>[]>([]);

  private adminService = inject( AdminService );
  private toastr = inject( ToastrService );  

  readonly dialogRef = inject(MatDialogRef<GenericDeleteModalComponent>);
  readonly data = inject<{columnDefs: TableColumn<T>[], item: any, url: string}>(MAT_DIALOG_DATA);  

  constructor(public bsModalRef: BsModalRef, private fb: FormBuilder) { }

  
  remove() {    
      this.adminService.remove(this.data.url, this.data.item).subscribe({
        next: resp => {
          this.toastr.success('Changes has been saved successfully');        
          this.dialogRef.close(resp);                              
        },
        error: err => {                                      
          this.dialogRef.close();
        }
      })
    } 
  }
