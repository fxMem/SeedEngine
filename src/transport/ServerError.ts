import { ErrorCode } from "./ErrorCodes";
import { LogFriendly } from "../log/LogFriendly";

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