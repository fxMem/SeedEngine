import { LogFriendly } from "@log";

export class ServerError implements LogFriendly {

    failed = true;
    constructor(public message: string) {

    }

    GetDebugString(): string {
        return `ServerError: ${this.message}`;
    }
}