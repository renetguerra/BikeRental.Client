import { Photo } from "./photo";

export interface Bike {
    id: number;    
    photoUrl: string;
    brand: string;
    model: string;        
    type: string;    
    year: number;
    isAvailable: boolean;   
    price: number; 
    bikePhotos: Photo[];
    // likedByUsers: LikedByUser[];
    // rentals: Rental[];    
}