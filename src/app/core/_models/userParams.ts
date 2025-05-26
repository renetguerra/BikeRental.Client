import { Params } from "./params";
import { User } from "./user";

export class UserParams extends Params {
    gender: string;
    minAge = 0;
    maxAge = 5;    
    orderBy = 'lastActive';

    constructor(user: User) {
        super();
        if (user?.roles.includes('Admin'))
            this.gender = '';
        else    
            this.gender = user?.gender === 'female' ? 'male' : 'female';
    }
}