
import { User } from "@users";
import { TransportMessageSender } from "./Transport";
import { ClientMessage } from "./Connection";

export class TargetBuilder {
    private targets: User[];
    private broadcast = false;

    constructor(private sender: (message: ClientMessage, options: { broadcast?: boolean, targets?: User[] }) => void, private message: ClientMessage) {

    }

    to(...users: User[]): this {
        this.targets = users;
        return this;
    }

    toAll(): this {
        this.broadcast = true;
        return this;
    }

    go(): void {
        this.sender(this.message, { targets: this.targets, broadcast: this.broadcast });
    }
}

export class MessageSender {
    constructor(private transport: TransportMessageSender) {

    }

    send(message: ClientMessage): TargetBuilder {
        return new TargetBuilder(this.transport.send.bind(this), message);
    }
}