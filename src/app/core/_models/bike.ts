import { Photo } from "./photo";

export interface Bike {
    id: number;
    photoUrl?: string;
    brand: string;
    model: string;
    type: string;
    year: string;
    isAvailable: boolean;
    price: number;
    comments?: string;
    bikePhotos: Photo[];
    // likedByUsers: LikedByUser[];
    // rentals: Rental[];
}
