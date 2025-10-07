import { Address } from "./address";
import { Photo } from "./photo";

export interface Member {
    id: number;
    name: string;
    surname: string;
    username: string;
    photoUrl: string;
    age: number;
    knownAs: string;
    email: string;
    phoneNumber: string;
    created: Date;
    lastActive: Date;
    gender: string;
    introduction: string;
    address: Address;
    userPhotos: Photo[];
    // Banking information
    bankName?: string;
    accountNumber?: string;
    routingNumber?: string;
    cardNumber?: string;
    cardHolderName?: string;
    expiryDate?: string;
    cvc?: string;
}
