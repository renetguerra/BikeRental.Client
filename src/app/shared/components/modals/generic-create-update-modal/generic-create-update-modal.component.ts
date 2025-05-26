import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild, inject, input, signal, viewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BsModalRef, ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { T } from '@angular/material/palette.d-f5ca9a2b';
import { TableColumn } from 'src/app/core/_models/generic';
import { AdminService } from 'src/app/core/_services/admin.service';
import { MatButtonModule } from '@angular/material/button';
import { MatTable } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-generic-create-update-modal',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,  
    FormsModule, ReactiveFormsModule, ModalModule, 
    TabsModule, 
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatButtonModule      
  ],
  templateUrl: './generic-create-update-modal.component.html',
  styleUrl: './generic-create-update-modal.component.css'
})
export class GenericCreateUpdateModalComponent implements OnInit {
  
  @HostListener('window:beforeunload', ['$event']) unloadNotification($event:any) {
    if (this.editForm?.dirty) {
      $event.returnValue = true;
    }
  }

  editForm!: FormGroup;
    
  readonly columnsInput = input<TableColumn<T>[]>([]);   
  columns = signal<TableColumn<T>[]>([]);
  
  url = '';
  itemId = 0;
  item: any = {};

  private adminService = inject( AdminService );
  private toastr = inject( ToastrService );  

  readonly dialogRef = inject(MatDialogRef<GenericCreateUpdateModalComponent>);
  readonly data = inject<{columnDefs: TableColumn<T>[], item: any, url: string}>(MAT_DIALOG_DATA);  

  @ViewChild(MatTable) table!: MatTable<any>;
  tableMat = viewChild<MatTable<any>>('table');

  constructor(public bsModalRef: BsModalRef, private fb: FormBuilder) { }

  ngOnInit(): void {    
    this.item = { ...this.data.item };    
    this.initForm();
  }

  private initForm(): void {
    const formControls = this.data.columnDefs.reduce((controls, col) => {
      controls[col.columnDef] = [ this.item[col.columnDef] || '', Validators.required];
      return controls;
    }, {} as any);
    
    this.editForm = this.fb.group(formControls);
  }

  load() {       
    this.adminService.getById(this.itemId, this.url).subscribe({
      next: item => this.item = {
        ...item,     
      }
    })   
  }

  save() {
    if (!this.data.item?.id) {    
      this.initForm();
    }
    if (this.editForm.valid) {
      const formData = this.editForm!.value as any;     

      this.adminService.save(this.data.url, this.item).subscribe({
        next: response => {
          this.toastr.success('Changes has been saved successfully');    
          this.dialogRef.close(response);                                        
        },
        error: err => {
          this.toastr.error('An error occurred while saving changes');
        }
      })
    } 
  }

}
