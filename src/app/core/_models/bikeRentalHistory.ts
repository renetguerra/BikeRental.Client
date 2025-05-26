import { Bike } from "./bike";
import { RentalHistoryCustomer } from "./rentalHistoryCustomer";

export interface BikeRentalHistory {
    bike: Bike;    
    rentals: RentalHistoryCustomer[];      
}