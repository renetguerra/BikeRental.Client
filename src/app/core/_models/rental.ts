export interface Rental {
    id: string;    
    bikeId: number;
    userId: number;
    startDate: Date;
    endDate: Date;
    isReturned: boolean;    
}