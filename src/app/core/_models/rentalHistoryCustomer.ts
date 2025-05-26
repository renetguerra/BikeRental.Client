export interface RentalHistoryCustomer {        
    userId: number;
    username: string;
    name: string;
    surname: string;
    photoUrl: string;
    bikeId: number;
    startDate: Date;
    endDate: Date;
    isReturned: boolean;    
}