import { v1 as uuid } from "uuid";
import { User } from "../users/User";

const FarFuture = new Date(2100, 1, 1);

export interface InvitationContext {
    user: User;
    requestedTime: Date;
}

export class Invite {

    id: string;
    constructor(
        public from: User,
        public sessionId: string,
        public note: string,
        private restrictedTo: User[],
        private expires?: Date,
        private useCount?: number) {

        if (!useCount) {
            this.useCount = Infinity;
        }

        if (!expires) {
            this.expires = FarFuture;
        }

        this.id = uuid();
    }

    isValid(context: InvitationContext): boolean {

        let userFits = (!this.restrictedTo || this.restrictedTo.length === 0) || 
            this.restrictedTo.some(u => u.nickname === context.user.nickname);
            
        return this.expires >= context.requestedTime
            && this.useCount > 0
            && userFits;
    }

    take(): boolean {
        this.useCount--;
        return this.useCount >= 0;
    }

    isExpired(): boolean {
        return this.expires <= new Date();
    }

    toString() {
        return `${this.id}/${this.expires}/Remain:${this.useCount}/Session:${this.sessionId}` + 
        (this.restrictedTo ? `/${this.restrictedTo.map(u => u.nickname)}` : '');
    }
}

export class InviteBuilder {
    private useCount: number;
    private users: User[] = [];
    private expires: Date;
    private note: string;

    constructor (private sessionId: string, private from: User) {

    }

    forUsers(users: User[]) {
        this.users = this.users.concat(users);
        return this;
    }

    validUntil(date: Date): this {
        this.expires = date;
        return this;
    }

    withUseCount(count: number): this {
        this.useCount = count;
        return this;
    }

    withNote(note: string): this {
        this.note = note;
        return this;
    }

    static forSession(sessionId: string, from: User): InviteBuilder {
        return new InviteBuilder(sessionId, from);
    }

    build(): Invite {
        return new Invite(this.from, this.sessionId, this.note, this.users, this.expires, this.useCount);
    }
}