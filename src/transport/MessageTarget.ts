import { User } from "../users";
import { Group } from "../server";

export class MessageTarget {

    constructor(public targets: string[]) {

    }

    static fromUser(user: User): MessageTarget {
        return new MessageTarget([user.id]);
    }

    static fromGroup(group: Group): MessageTarget {
        return new MessageTarget(group.getUsers().map(u => u.id));
    }
}