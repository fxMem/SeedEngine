import { User } from "@users";
import { EventEmitter } from "events";

const onUserAdded = 'onUserAdded';
const onUserRemoved = 'onUserRemoved';
const onGroupClosed = 'onGroupClosed';

export class Group extends EventEmitter {
    users = new Map<string, User>();

    constructor(users: User[], private id: string, private description?: string) {
        super();

        for (const user of users) {
            this.users.set(user.id, user);
        }
    }

    getId(): string {
        return this.id;
    }

    getDescription(): string {
        return this.description;
    }

    addUser(user: User) {
        if (!this.users.has(user.id)) {
            this.users.set(user.id, user);
            this.emit(onUserAdded, user);
        }
    }

    removeUser(user: User, reason?: string) {
        if (this.users.has(user.id)) {
            this.users.delete(user.id);
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