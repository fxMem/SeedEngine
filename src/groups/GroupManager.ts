import { DefaultGroup, Group, GroupHandle } from "./Group";
import { GroupIdGenerator } from "./GroupIdGenerator";
import { createLocalLogScope } from "../log";
import { Users, User, nickname, Claims } from "../users";
import { ServerError } from "../transport";
import { getUserInfoArray } from "../users/UserInfoArray";

export interface Groups {
    getGroup(groupId: string): Group;
}

const groupsKeyId = '__groups';

export class GroupManager implements Groups {

    private log = createLocalLogScope(nameof(GroupManager));
    private groups = new Map<string, GroupHandle>();

    // TODO: create means to 'reload' existing groups after server restart
    // (probably by iterating over players and 'rejoining' them to groups?)
    constructor(private users: Users, private idGenerator: GroupIdGenerator) {

    }

    createGroup(creator: User, add: nickname[], description?: string): GroupHandle {

        if (!creator.haveClaim(Claims.createGroup)) {
            throw new ServerError(`User ${creator} is not allowed to create groups!`);
        }

        let id = this.idGenerator.getNext();
        let group = new DefaultGroup((add || []).map(t => this.users.getUserByNickname(t)), id);
        this.groups.set(id, group);

        this.log.info(`Group ${id} created with users ${add}`);
        return group;
    }

    addUsers(targets: nickname[], groupId: string) {
        if (!targets) {
            throw new ServerError(`Targets should be provided!`);
        }

        let group = this.getGroup(groupId) as GroupHandle;
        for (const user of targets.map(t => this.users.getUserByNickname(t))) {
            group.addUser(user);

            let userGroups = getUserInfoArray<string>(user, groupsKeyId);
            userGroups.add(groupId);
        }

        this.log.info(`Users ${targets} were added to group ${group}`);
    }

    leaveGroup(user: User, groupId: string) {
        let group = this.getGroup(groupId) as GroupHandle;
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