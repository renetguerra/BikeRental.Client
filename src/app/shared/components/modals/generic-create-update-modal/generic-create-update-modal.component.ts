import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild, inject, input, signal, viewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BsModalRef, ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { TableColumn } from 'src/app/core/_models/generic';
import { AdminService } from 'src/app/core/_services/admin.service';
import { MatButtonModule } from '@angular/material/button';
import { MatTable } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { PhotoEditorComponent } from '../../photo-editor/photo-editor.component';
import { PhotoConfig } from 'src/app/core/_models/genericPhotoConfig';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-generic-create-update-modal',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule, ReactiveFormsModule, ModalModule,
    TabsModule,
  MatDialogModule, MatFormFieldModule, MatInputModule,
  MatButtonModule,
  MatIconModule,
  MatSlideToggleModule,
  MatTabsModule,
  TranslocoModule
  ],
  templateUrl: './generic-create-update-modal.component.html',
  styleUrl: './generic-create-update-modal.component.css'
})
export class GenericCreateUpdateModalComponent implements OnInit {
  private transloco = inject(TranslocoService);

  @HostListener('window:beforeunload', ['$event']) unloadNotification($event:any) {
    if (this.editForm?.dirty) {
      $event.returnValue = true;
    }
  }

  editForm!: FormGroup;

  readonly columnsInput = input<TableColumn<any>[]>([]);
  columns = signal<TableColumn<any>[]>([]);

  url = '';
  itemId = 0;
  item: any = {};

  private adminService = inject( AdminService );
  private toastr = inject( ToastrService );

  readonly dialogRef = inject(MatDialogRef<GenericCreateUpdateModalComponent>);
  readonly data = inject<{
    columnDefs: TableColumn<any>[];
    item: any;
    url: string;
    urlServerPath?: string;
    photoConfig?: PhotoConfig<any>;
    onPhotoAdded?: (photo: any, updated: any) => void;
    onPhotoDeleted?: (photoId: string, updated: any) => void;
    onSaved?: (result: any) => void;
  }>(MAT_DIALOG_DATA);
  readonly dialog = inject(MatDialog);

  @ViewChild(MatTable) table!: MatTable<any>;
  tableMat = viewChild<MatTable<any>>('table');

  constructor(public bsModalRef: BsModalRef, private fb: FormBuilder) { }

  ngOnInit(): void {
     this.item = { ...this.data.item };
     if (typeof this.item.isAvailable === 'undefined') {
      this.item.isAvailable = true;
     }
     this.initForm();
  }

  private initForm(): void {
      const formControls = this.data.columnDefs.reduce((controls, col) => {
        if (col.columnDef !== 'photoUrl') {
          controls[col.columnDef] = [ this.item[col.columnDef] || '', Validators.required];
        }
        return controls;
      }, {} as any);

      this.editForm = this.fb.group(formControls);
  }

  private getEntityId(entity: any): number | undefined {
    if (!entity) return undefined;
    if (typeof entity.id === 'number') return entity.id;
    if (entity.bike && typeof entity.bike.id === 'number') return entity.bike.id;
    if (entity.value && typeof entity.value.id === 'number') return entity.value.id;
    if (entity.value && entity.value.bike && typeof entity.value.bike.id === 'number') return entity.value.bike.id;
    return undefined;
  }

  load() {
    this.adminService.getById(this.itemId, this.url).subscribe({
      next: item => this.item = {
        ...item!,
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
            this.toastr.success(this.transloco.translate('genericCreateUpdateModal.success'));
            // Unwrap response.value if present, else use response
            this.item = (response && typeof response === 'object' && 'value' in response) ? response.value : response;
            if (typeof this.data.onSaved === 'function') {
              this.data.onSaved(this.item);
            }
        },
        error: err => {
          this.toastr.error(this.transloco.translate('genericCreateUpdateModal.error'));
        }
      })
    }
  }

  openDialogAddPhoto() {
  const entityId = this.getEntityId(this.item);
  const urlServerPathWithId = entityId ? `${this.data.urlServerPath}${entityId}` : this.data.urlServerPath;
      const dialogRef = this.dialog.open(PhotoEditorComponent<any>, {
        width: '800px',
        maxWidth: '90vw',
        height: '75vh',
        maxHeight: '80vh',
        panelClass: 'photo-editor-dialog',
        hasBackdrop: true,
        backdropClass: 'photo-editor-backdrop',
        disableClose: true,
        autoFocus: false,
        restoreFocus: false,
        data: {
          entity: this.item,
          urlServerPath: urlServerPathWithId,
          photoConfig: this.data.photoConfig,
          onPhotoAdded: (photo: any, updatedEntity: any) => {
            // Unwrap updatedEntity.value if present
            this.item = (updatedEntity && typeof updatedEntity === 'object' && 'value' in updatedEntity) ? updatedEntity.value : updatedEntity;
            Object.keys(this.editForm.controls).forEach(key => {
              if (this.item.hasOwnProperty(key)) {
                this.editForm.get(key)?.setValue(this.item[key]);
                this.item = { ...updatedEntity };
              }
            });
            if (this.data.onPhotoAdded) {
              this.data.onPhotoAdded(photo, this.item);
              this.item = { ...updatedEntity };
            }
          },
          onPhotoDeleted: (photoId: string, updatedEntity: any) => {
            // Unwrap updatedEntity.value if present
            this.item = (updatedEntity && typeof updatedEntity === 'object' && 'value' in updatedEntity) ? updatedEntity.value : updatedEntity;
            Object.keys(this.editForm.controls).forEach(key => {
              if (this.item.hasOwnProperty(key)) {
                this.editForm.get(key)?.setValue(this.item[key]);
                this.item = { ...updatedEntity };
              }
            });
            if (this.data.onPhotoDeleted) {
              this.data.onPhotoDeleted(photoId, this.item);
              this.item = { ...updatedEntity };
            }
          }
        }
      });
  }

}
