import { LogFriendly } from "@log";

export class ServerError implements LogFriendly {

    constructor(public message: string) {

    }

    GetDebugString(): string {
        return `ServerError: ${this.message}`;
    }
}