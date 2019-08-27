
import { EventEmitter } from "events";
import { User, nickname } from "../users/User";

const onUserAdded = 'onUserAdded';
const onUserRemoved = 'onUserRemoved';
const onGroupClosed = 'onGroupClosed';

// Extracting this interface we prohibit users to invoke addUser / removeUser by hand (which
// should be done via GroupManager)
export interface Group {
    id: string;
    description?: string;
    getUsers(): User[];
}

export interface GroupHandle extends Group {
    addUser(user: User): void;
    removeUser(user: User, reason?: string): void;
    close(reason?: string): void;
}

export class DefaultGroup extends EventEmitter implements GroupHandle {
    usersMap = new Map<nickname, User>();

    constructor(users: User[], public id: string, public description?: string) {
        super();

        for (const user of users) {
            this.usersMap.set(user.nickname, user);
        }
    }

    getUsers(): User[] {
        return Array.from((this.usersMap as any).values());
    }

    addUser(user: User) {
        if (!this.usersMap.has(user.nickname)) {
            this.usersMap.set(user.nickname, user);
            this.emit(onUserAdded, user);
        }
    }

    removeUser(user: User, reason?: string) {
        if (this.usersMap.has(user.nickname)) {
            this.usersMap.delete(user.nickname);
            this.emit(onUserRemoved, user, reason);
        }
    }

    close(reason?: string) {
        this.emit(onGroupClosed, reason);
    }

    onUserAdded(callback: (user: User) => void) {
        this.on(onUserAdded, callback);
    }

    onUserRemoved(callback: (user: User, reason: string) => void) {
        this.on(onUserRemoved, callback);
    }

    onGroupClosed(callback: (reason: string) => void) {
        this.on(onUserRemoved, callback);
    }

    toString() {
        return `${this.id}`;
    }
}