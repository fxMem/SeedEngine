import { UserStorage } from "./UserStorage";
import { User } from "./User";
import { ClientMessage, TransportMessageSender } from "@transport";

export interface Users {
    getUserById(userId: string): User;
    getUserByNickname(nickname: string): User;

    connect(userId: string, user: User): void;
    disconnect(userId: string): void;
}

export class DefaultUserManager implements Users {
    
    private idsMap: Map<string, string> = new Map<string, string>();
    private users: Map<string, User> = new Map<string, User>();

    getUserByNickname(nickname: string): User {
        return this.getUserById(this.idsMap.get(nickname));
    }

    getUserById(userId: string): User {
        return this.users.get(userId);
    }    
    
    connect(userId: string, user: User): void {
        this.users.set(userId, user);
    }

    disconnect(userId: string): void {
        this.users.delete(userId);
    }
}