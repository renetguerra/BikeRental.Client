import { signal } from "@angular/core";

export class Params {
    
    readonly pageNumber = signal<number>(1);
    pageSize = 20;    
    
}