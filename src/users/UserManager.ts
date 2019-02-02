import { UserStorage } from "./UserStorage";
import { User } from "./AuthMethod";


export interface UserManager {
    getUser(userId: string): User;

    connect(userId: string, user: User): void;

    disconnect(userId: string): void;
}

export class DefaultUserManager implements UserManager {
    private users: Map<string, User> = new Map<string, User>();

    constructor(private userStorage: UserStorage) {

    } 

    getUser(userId: string): User {
        return this.users.get(userId);
    }    
    
    connect(userId: string, user: User): void {
        this.users.set(userId, user);
    }

    disconnect(userId: string): void {
        this.users.delete(userId);
    }
}