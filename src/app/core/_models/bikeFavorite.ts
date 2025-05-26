export interface BikeFavorite {        
    userId: number;
    bikeId: number;
    model: string;
    brand: string;
    type: string;
    year: string;
    available: boolean;
    photoUrl: string;
    startDate: Date;
    endDate: Date;
    isReturned: boolean;    
}