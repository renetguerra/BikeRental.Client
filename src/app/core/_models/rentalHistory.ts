export interface RentalHistory {
    id: string;    
    bikeId: number;
    modelBike: string;
    brandBike: string;
    priceBike: number;
    photoUrl: string;
    userId: number;
    startDate: Date;
    endDate: Date;
    isReturned: boolean;    
}