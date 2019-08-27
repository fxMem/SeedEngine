import { TransportMessageSender } from "./Transport";
import { ClientMessage } from "./Connection";
import { MessageTarget } from "./MessageTarget";
import { createLocalLogScope } from "../log/LoggerScopes";
import { User } from "../users/User";
import { Group } from "../groups/Group";

export class TargetBuilder {
    private log = createLocalLogScope('MessageSender');
    private targets: MessageTarget[];
    private broadcast = false;

    constructor(private sender: (message: ClientMessage, options: { broadcast?: boolean, targets?: MessageTarget[] }) => void, private message: ClientMessage) {

    }

    to(...targets: MessageTarget[]): this {
        this.targets = targets
        return this;
    }

    toUsers(...users: User[]): this {
        this.targets = users.map(u => MessageTarget.fromUser(u));
        return this;
    }

    toGroups(...groups: Group[]): this {
        this.targets = groups.map(g => MessageTarget.fromGroup(g));
        return this;
    }

    toAll(): this {
        this.broadcast = true;
        return this;
    }

    go(): void {
        let haveTargets = this.targets && this.targets.length > 0;
        if (haveTargets || this.broadcast) {
            this.log.info(`Sending message ${JSON.stringify(this.message)} to ${JSON.stringify(this.targets)} (broadcast = ${this.broadcast})`)
            this.sender(this.message, { targets: this.targets, broadcast: this.broadcast });
        }
        else {
            this.log.warn(`Sending message ${JSON.stringify(this.message)} failed because there is no suitable targets!`);
        }
    }
}

export class MessageSender {
    constructor(private transport: TransportMessageSender) {

    }

    send(message: ClientMessage): TargetBuilder {
        return new TargetBuilder(this.transport.send.bind(this.transport), message);
    }
}