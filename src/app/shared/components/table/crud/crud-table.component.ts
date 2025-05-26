import { CommonModule } from "@angular/common";
import { Component, WritableSignal, signal, inject, input, effect, computed } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import {MatTableModule} from '@angular/material/table';
import { GenericCreateUpdateModalComponent } from "../modals/generic-create-update-modal/generic-create-update-modal.component";
import { GenericDeleteModalComponent } from "../modals/generic-delete-modal/generic-delete-modal.component";
import { AccountService } from "src/app/core/_services/account.service";
import { User } from "src/app/core/_models/user";
import { TableColumn } from "src/app/core/_models/generic";
import { Pagination } from "src/app/core/_models/pagination";

@Component({
  selector: 'app-crud-table',  
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatDialogModule, MatIconModule, MatTableModule],
  templateUrl: './crud-table.component.html',
  styleUrls: ['./crud-table.component.css']
})
export class CrudTableComponent<T> {
    private accountService = inject(AccountService); 
    readonly dialog = inject(MatDialog);             
    
    user = signal<User>(this.accountService.currentUser()!);

    pagination: WritableSignal<Pagination | undefined> = signal(undefined);
    pageNumber: number = 1;
    pageSize: number = 15; 

    readonly serviceApiUrl = input<string>();            
    
    readonly columnsInput = input<TableColumn<T>[]>([]);
    private readonly _columns = signal<TableColumn<T>[]>([]);   
    readonly columns = computed(() => this._columns());
        
    arrayGenericData = input<T[]>([]);
    itemData = signal<T>({} as T);
            
    dataSourceInput = input<T[]>([]);
    dataSource = signal<T[]>([]);
        
    displayedColumns: string[] = [];
    columnsToDisplayWithExpand: string[] = [];

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
      }
    });
  }   

  openDialogEdit(item?: T): void {        
      const config = {
          class: 'modal-dialog-centered modal-lg',
          data: {         
              item: item != undefined ? { ...item } : { id: 0 },    
              columnDefs: this.columns().filter(c => c.header !== 'Actions'),
              url: this.serviceApiUrl()!,
          }
      }
      const dialogRef = this.dialog.open( GenericCreateUpdateModalComponent, config );                            
      dialogRef.afterClosed().subscribe((result) => {
          if (result) {            
            this.refreshDataSource(result);
          }               
        });    
    }

  private refreshDataSource(item: any) {
    const exists = this.dataSource().some( (n: any) => n.id === item.id);
    if (!exists) {                                
      this.addItemToDataSource(item);
    }
    else {
      this.updateItemInDataSource(item);
    } 
  }

  private updateItemInDataSource(updatedItem: any) {
    const updatedData = this.dataSource().map((item: any) =>
      item.id === updatedItem.id ? updatedItem : item
    );    
    this.dataSource.set(updatedData); 
  }

  private addItemToDataSource(newItem: any) {
    const newData = [...this.dataSource(), newItem];    
    this.dataSource.set(newData); 
  }

  openDialogDelete(item: any): void {
    console.log('onDelete called with item:', item); 
    const config = {
        class: 'modal-dialog-centered modal-lg',
        data: {            
            item: { ...item },    
            columnDefs: this.columns().filter(c => c.header !== 'actions'),
            url: this.serviceApiUrl()!,
        }
      }
      const dialogRef = this.dialog.open( GenericDeleteModalComponent, config );
      
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {            
          this.dataSource.set(this.dataSource().filter((i: any) => i.id !== result.id)); 
        }
      });
  }  

  getCellRendererParams(): any {
    return {
      componentParent: this 
    };
  }

  setColumnDefs(): void {
    this.columns;
  }

  onRowClicked(event: { data: any }): void {    
    this.itemData.set({ ...event.data }) ;
  }

}
