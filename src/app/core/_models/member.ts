import { Address } from "./address";
import { Photo } from "./photo";

export interface Member {
    id: number;    
    username: string;
    photoUrl: string;
    age: number;
    knownAs: string;
    created: Date;
    lastActive: Date;
    gender: string;
    introduction: string;        
    address: Address;
    userPhotos: Photo[];    
}