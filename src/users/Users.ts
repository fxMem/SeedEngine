import { User, nickname, userId } from "./User";

export interface Users {
    getUserById(userId: string): User;
    getUserByNickname(nickname: string): User;
}

export interface UserManager extends Users {
    connect(userId: string, user: User): void;
    disconnect(userId: string): void;
}

export class DefaultUserManager implements UserManager {
    
    private idsMap: Map<string, string> = new Map<string, string>();
    private users: Map<string, User> = new Map<string, User>();

    getUserByNickname(nickname: nickname): User {
        return this.getUserById(this.idsMap.get(nickname));
    }

    getUserById(userId: userId): User {
        return this.users.get(userId);
    }    
    
    connect(userId: userId, user: User): void {
        this.users.set(userId, user);
    }

    disconnect(userId: userId): void {
        this.users.delete(userId);
    }
}