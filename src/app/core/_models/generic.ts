import { DataSource } from "@angular/cdk/collections";
import { Observable, ReplaySubject } from "rxjs";

export class SearchParameterGeneric {
    textFilter?: string;
    maxPrice = 100;
    minPrice = 10;
    categoryId?: number;
    pageNumber = 1;
    pageSize = 15;

}

export class SearchParamGenericResult<T> {
    result?: T;
    param?: SearchParameterGeneric;
}

export class GenericItem<T> {
    id?: number | string;
    item?: T;
}

export interface TableColumn<T> {
    columnDef: string;
    header: string;
    cell?: (element: T) => string | number | boolean;
    isCustomRender?: boolean;
}

export class GenericDataSource extends DataSource<any> {
    private _dataStream = new ReplaySubject<any[]>();

    constructor(initialData: any[]) {
      super();
      this.setData(initialData);
    }

    connect(): Observable<any[]> {
      return this._dataStream;
    }

    disconnect() {}

    setData(data: any[]) {
      this._dataStream.next(data);
    }
  }
