export interface User {
    username: string;
    token: string;
    photoUrl: string;
    knownAs: string;
    gender: string;
    canSendMessages: boolean;
    roles: string[];
}