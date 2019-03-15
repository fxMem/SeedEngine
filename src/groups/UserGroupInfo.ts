import { User } from "@users";

const groupsKeyId = 'groups';
export function getUserGroups(user: User): string[] {
    return user.data[groupsKeyId];
}

export function removeUserGroup(user: User, groupId: string) {
    let groups = user.data[groupsKeyId] as string[];
    if (groups) {
        groups = groups.filter(g => g !== groupId);
        user.data[groupsKeyId] = groups;
    }
}

export function addUserGroup(user: User, groupId: string) {
    let groups = user.data[groupsKeyId];
    if (!groups) {
        groups = [];
        user.data[groupsKeyId] = groups;
    }

    groups.push(groupId);
}