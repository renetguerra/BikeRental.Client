import { signal } from "@angular/core";

export class Params {

    pageNumber = signal<number>(1);
    pageSize = 20;

    textFilter = signal<string>('');
    searchFilter = signal<string>('')

}
