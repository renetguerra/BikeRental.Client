import { Address } from "./address";
import { BankAccount } from "./bankAccount";
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
    bankAccount: BankAccount;
    userPhotos: Photo[];
}
