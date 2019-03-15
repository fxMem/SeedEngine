
import { User } from "@users";
import { TransportMessageSender } from "./Transport";
import { ClientMessage } from "./Connection";
import { Group } from "@groups/Group";

export class TargetBuilder {
    private targets: string[];
    private broadcast = false;

    constructor(private sender: (message: ClientMessage, options: { broadcast?: boolean, targets?: string [] }) => void, private message: ClientMessage) {

    }

    // TODO: think of better way to represent targets. Maybe something like
    // interface Targetable?
    to(...targets: string[]): this {
        this.targets = targets
        return this;
    }

    toUsers(...users: User[]): this {
        this.targets = users.map(u => u.id);
        return this;
    }

    toGroups(...groups: Group[]): this {
        this.targets = groups.map(g => g.getId());
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
        return new TargetBuilder(this.transport.send.bind(this.transport), message);
    }
}