import { Users, User, nickname } from "@users";
import { createLocalLogScope } from "@log";

import { ServerError } from "@transport";
import { DefaultGroup, Group } from "./Group";
import { GroupIdGenerator } from "./GroupIdGenerator";
import { addUserGroup } from "./UserGroupInfo";

export const chatMessageClientHeader = 'chat';

export interface Groups {
    getGroup(groupId: string): Group;
}

export class GroupManager implements Groups {

    private log = createLocalLogScope(nameof(GroupManager));
    private groups = new Map<string, DefaultGroup>();

    // TODO: create means to 'reload' existing groups after server restart
    // (probably by iterating over players and 'rejoining' them to groups?)
    constructor(private users: Users, private idGenerator: GroupIdGenerator) {

    }

    createGroup(targets: nickname[], description?: string): DefaultGroup {

        let id = this.idGenerator.getNext();
        let group = new DefaultGroup((targets || []).map(t => this.users.getUserByNickname(t)), id);
        this.groups.set(id, group);

        this.log.info(`Group ${id} created with users ${targets}`);
        return group;
    }

    addUsers(targets: nickname[], groupId: string) {
        if (!targets) {
            throw new ServerError(`Targets should be provided!`);
        }

        let group = this.getGroup(groupId) as DefaultGroup;
        for (const user of targets.map(t => this.users.getUserByNickname(t))) {
            group.addUser(user);
            addUserGroup(user, groupId);
        }

        this.log.info(`Users ${targets} were added to group ${group}`);
    }

    leaveGroup(user: User, groupId: string) {
        let group = this.getGroup(groupId) as DefaultGroup;
        group.removeUser(user);

        this.log.info(`User ${user} left group ${group}`);
    }

    getGroup(groupId: string): Group {
        if (!groupId) {
            throw new ServerError(`Group id is not provided!`);
        }

        let group = this.groups.get(groupId);
        if (!group) {
            throw new ServerError(`Group with id ${groupId} does not exist`);
        }

        return group;
    }

}