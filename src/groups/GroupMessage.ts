import { Message } from "@transport";

export enum GroupCommand {
    create,
    join,
    addOthers, 
    leave
}

export interface GroupMessage extends Message, GroupOptions, GroupTargetOptions {
    groupCommand: GroupCommand
}

export interface GroupOptions {
    groupId?: string;
    groupDescription?: string;
}

export interface GroupTargetOptions {
    targets?: string[];
}

export function isGroupMessage(message: any): message is GroupMessage {
    return message.groupCommand !== undefined;
}