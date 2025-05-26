import { CommonModule } from '@angular/common';
import {
  Component,
  WritableSignal,
  signal,
  inject,
  input,
  effect,
  computed,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { AccountService } from 'src/app/core/_services/account.service';
import { User } from 'src/app/core/_models/user';
import { TableColumn } from 'src/app/core/_models/generic';
import { Pagination } from 'src/app/core/_models/pagination';
import { RentalHistory } from 'src/app/core/_models/rentalHistory';

@Component({
  selector: 'app-common-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatTableModule,
  ],
  templateUrl: './common-table.component.html',
  styleUrls: ['./common-table.component.css'],
})
export class CommonTableComponent<T> {
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
        this._columns.set(
          receivedCols.map((c: TableColumn<T>) => ({
            ...c,
            cell: c.cell,
          }))
        );

        this.displayedColumns = this.columns().map((c) => c.columnDef);
      }
    });

    effect(() => {
      const newDataSource = this.dataSourceInput();
      if (newDataSource) {
        this.dataSource.set(newDataSource);
      }
    });
  }  

  onImageError(event: Event, row: RentalHistory) {
    const target = event.target as HTMLImageElement;    
    target.src = row.photoUrl || '';
  }

  getCellRendererParams(): any {
    return {
      componentParent: this,
    };
  }

  setColumnDefs(): void {
    this.columns;
  }

  onRowClicked(event: { data: any }): void {
    this.itemData.set({ ...event.data });
  }
}
