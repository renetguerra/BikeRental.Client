import { Rental } from "./rental";
import { RentalHistory } from "./rentalHistory";
import { User } from "./user";

export interface CustomerRentalHistory {
    customer: User;    
    rentals: RentalHistory[];      
}