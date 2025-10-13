import { CommonModule } from "@angular/common";
import { Component, WritableSignal, signal, inject, input, effect, computed } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { ViewChild, AfterViewInit } from '@angular/core';
import { AccountService } from "src/app/core/_services/account.service";
import { User } from "src/app/core/_models/user";
import { TableColumn } from "src/app/core/_models/generic";
import { Pagination } from "src/app/core/_models/pagination";
import { GenericCreateUpdateModalComponent } from "../../modals/generic-create-update-modal/generic-create-update-modal.component";
import { GenericDeleteModalComponent } from "../../modals/generic-delete-modal/generic-delete-modal.component";
import { PhotoConfig } from 'src/app/core/_models/genericPhotoConfig';

@Component({
  selector: 'app-crud-table',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatDialogModule, MatIconModule, MatTableModule, MatPaginatorModule],
  templateUrl: './crud-table.component.html',
  styleUrls: ['./crud-table.component.css']
})
export class CrudTableComponent<T> implements AfterViewInit {
  private accountService = inject(AccountService);
  readonly dialog = inject(MatDialog);

  user = signal<User>(this.accountService.currentUser()!);

  pagination: WritableSignal<Pagination | undefined> = signal(undefined);
  pageNumber = 1;
  pageSize = 15;

  readonly serviceApiUrl = input<string>();
  readonly photoConfigInput = input<PhotoConfig<T> | undefined>(undefined);
  readonly urlServerPathInput = input<string | undefined>(undefined);

  readonly columnsInput = input<TableColumn<T>[]>([]);
  private readonly _columns = signal<TableColumn<T>[]>([]);
  readonly columns = computed(() => this._columns());

  arrayGenericData = input<T[]>([]);
  itemData = signal<T>({} as T);

  dataSourceInput = input<T[]>([]);
  dataSource = signal<T[]>([]);
  tableData = new MatTableDataSource<T>([]);

  displayedColumns: string[] = [];
  columnsToDisplayWithExpand: string[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor() {

    effect(() => {
      const receivedCols = this.columnsInput();
      if (receivedCols) {
        this._columns.set(receivedCols.map((c: TableColumn<T>) => ({
          ...c,
          cell: c.cell
        })));

        this.displayedColumns = this.columns().map(c => c.columnDef);
        this.columnsToDisplayWithExpand = [...this.displayedColumns, 'actions'];
      }
    });

    effect(() => {
      const newDataSource = this.dataSourceInput();
      if (newDataSource) {
        this.dataSource.set(newDataSource);
        this.tableData.data = newDataSource;
      }
    });
  }

  openDialogEdit(item?: T): void {
      // Use correct endpoint for create or update
      let url = this.serviceApiUrl();
      const isEdit = item && typeof (item as any).id !== 'undefined' && (item as any).id > 0;
      if (isEdit) {
        url = `bike/update`;
      }
      const data: any = {
        item: item != undefined ? { ...item } : { id: 0 },
        columnDefs: this.columns().filter(c => c.header !== 'Actions'),
        url,
        onSaved: (result: any) => {
          if (result) {
            this.refreshDataSource(result);
          }
        },
        onPhotoAdded: (photo: any, updatedEntity: any) => { this.updateItemInDataSource(updatedEntity); },
        onPhotoDeleted: (photoId: string, updatedEntity: any) => { this.updateItemInDataSource(updatedEntity); }
      };
    // Pass photoConfig and urlServerPath only if present
    if (this.photoConfigInput()) {
      data.photoConfig = this.photoConfigInput();
    }
    if (this.urlServerPathInput()) {
      data.urlServerPath = this.urlServerPathInput();
    }
    const config = {
      class: 'modal-dialog-centered',
      width: '800px',
      maxWidth: '90vw',
      height: '75vh !important',
      maxHeight: '80vh',
      panelClass: 'photo-editor-dialog',
      hasBackdrop: true,
      backdropClass: 'photo-editor-backdrop',
      disableClose: true,
      autoFocus: false,
      restoreFocus: false,
      data
    };
    const dialogRef = this.dialog.open(GenericCreateUpdateModalComponent, config);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshDataSource(result);
      }
    });
  }

  private refreshDataSource(item: any) {
    // Always update in place by id; never add duplicate
    if (item && typeof item.id !== 'undefined') {
      const updatedData = this.tableData.data.map((n: any) => n.id === item.id ? item : n);
      // If not found, add as new
      const found = this.tableData.data.some((n: any) => n.id === item.id);
      this.tableData.data = found ? updatedData : [...this.tableData.data, item];
    }
  }

  private updateItemInDataSource(updatedItem: any) {
    const updatedData = this.tableData.data.map((item: any) =>
      item.id === updatedItem.id ? updatedItem : item
    );
    this.tableData.data = updatedData;
  }

  private addItemToDataSource(newItem: any) {
    const newData = [...this.tableData.data, newItem];
    this.tableData.data = newData;
  }

  openDialogDelete(item: any): void {
    console.log('onDelete called with item:', item);
    // Build correct delete URL: 'bike/remove-bike/id'
    const deleteUrl = item && typeof item.id !== 'undefined' ? `bike/remove-bike/${item.id}` : 'bike/remove-bike';
    const config = {
      class: 'modal-dialog-centered modal-lg',
      data: {
        item: { ...item },
        columnDefs: this.columns().filter(c => c.header !== 'actions'),
        url: deleteUrl,
      }
    }
      const dialogRef = this.dialog.open(GenericDeleteModalComponent, config );

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.tableData.data = this.tableData.data.filter((i: any) => i.id !== result.id);
        }
      });
  }

  getCellRendererParams(): any {
    return {
      componentParent: this
    };
  }

  setColumnDefs(): void { /* columns are driven by inputs */ }

  onRowClicked(event: { data: any }): void { this.itemData.set({ ...event.data }); }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.tableData.paginator = this.paginator;
    }
  }

  // Handle image fallback for rows without valid photo
  onImageError(evt: Event) {
    const target = evt.target as HTMLImageElement;
    target.src = '';
  }

}
