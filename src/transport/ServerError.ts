import { LogFriendly } from "../log";
import { ErrorCode } from "./ErrorCodes";

export class ServerError implements LogFriendly {

    constructor(public message: string, public code?: ErrorCode) {
        this.code = code || ErrorCode.InternalError;
    }

    GetDebugString(): string {
        return `ServerError: ${this.message}`;
    }

    toString() {
        return this.message;
    }
}

export class UnauthorizedError extends ServerError {

    constructor(message: string) {
        super(message, ErrorCode.Unauthorized);
    }
}

export class DeniedError extends ServerError {

    constructor(message: string) {
        super(message, ErrorCode.Denied);
    }
}