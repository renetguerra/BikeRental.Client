import { CommonModule } from '@angular/common';
import {
  Component,
  WritableSignal,
  signal,
  inject,
  input,
  effect,
  computed,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { AccountService } from 'src/app/core/_services/account.service';
import { User } from 'src/app/core/_models/user';
import { TableColumn } from 'src/app/core/_models/generic';
import { Pagination } from 'src/app/core/_models/pagination';
import { RentalHistory } from 'src/app/core/_models/rentalHistory';
import { Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

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
    MatPaginatorModule,
    TranslocoModule,
  ],
  templateUrl: './common-table.component.html',
  styleUrls: ['./common-table.component.css'],
})
export class CommonTableComponent<T> implements AfterViewInit {
  private accountService = inject(AccountService);
  readonly dialog = inject(MatDialog);

  private router = inject(Router);

  user = signal<User>(this.accountService.currentUser()!);

  pagination: WritableSignal<Pagination | undefined> = signal(undefined);
  pageNumber = 1;
  pageSize = 15;

  readonly serviceApiUrl = input<string>();
  readonly navigateUrlBase = input<string>(''); // Base URL for navigation
  readonly navigateUrlProperty = input<string>('id'); // Property to use for URL parameter
  readonly onRowClick = input<((row: T) => void) | undefined>(undefined); // Custom click handler
  readonly isRowClickable = input<boolean>(true); // Enable/disable row clicking

  readonly columnsInput = input<TableColumn<T>[]>([]);
  private readonly _columns = signal<TableColumn<T>[]>([]);
  readonly columns = computed(() => this._columns());

  arrayGenericData = input<T[]>([]);
  itemData = signal<T>({} as T);

  dataSourceInput = input<T[]>([]);
  // Raw data signal (optional for other logic)
  dataSource = signal<T[]>([]);
  // MatTableDataSource for client-side pagination/sort
  tableData = new MatTableDataSource<T>([]);

  displayedColumns: string[] = [];
  columnsToDisplayWithExpand: string[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

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
        // keep raw signal for external uses
        this.dataSource.set(newDataSource);
        // update MatTableDataSource for pagination
        this.tableData.data = newDataSource;
      }
    });
  }

  onImageError(event: Event, row: RentalHistory) {
    const target = event.target as HTMLImageElement;
    target.src = row.photoUrl || '';
  }

  getCellRendererParams(): Record<string, unknown> {
    return {
      componentParent: this,
    };
  }

  setColumnDefs(): void {
    // Column definitions are set via input signal
  }

  onRowClicked(row: T): void {
    this.itemData.set({ ...row });

    // If custom click handler is provided, use it
    const customHandler = this.onRowClick();
    if (customHandler) {
      customHandler(row);
      return;
    }

    // If row clicking is disabled, do nothing
    if (!this.isRowClickable()) {
      return;
    }

    // Generic navigation logic
    const baseUrl = this.navigateUrlBase();
    const urlProperty = this.navigateUrlProperty();

    if (baseUrl && urlProperty) {
      const paramValue = (row as Record<string, unknown>)[urlProperty];

      if (paramValue !== undefined && paramValue !== null) {
        const navigationUrl = baseUrl.endsWith('/')
          ? `${baseUrl}${paramValue}`
          : `${baseUrl}/${paramValue}`;

        this.router.navigateByUrl(navigationUrl);
      }
    }
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.tableData.paginator = this.paginator;
    }
  }
}
