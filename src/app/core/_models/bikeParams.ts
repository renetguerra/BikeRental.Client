import { Bike } from "./bike";
import { Params } from "./params";

export class BikeParams extends Params {
    model: string = '';
    year = 0;
    brand: string = '';
    type: string = '';    
    isAvailable: boolean = true;   
    minPrice: number = 0;
    maxPrice: number = 0;
    orderBy = 'lastActive';

    constructor(bike: Bike) {
        super();                        
    }
}