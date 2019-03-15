import { Client, ClientConnectionHandler } from "@client";
import { GroupMessage, GroupCommand } from "./GroupMessage";
import { OperationResult } from "@core";

export class GroupClient implements Client {
    handler: ClientConnectionHandler;

    createGroup(nicknames?: string[], description?: string): Promise<{ groupId: string }> {
        return this.handler.invokeWithMessage<GroupMessage>({
            groupCommand: GroupCommand.create,
            targets: nicknames,
            groupDescription: description
        });
    }

    leaveGroup(groupId: string): Promise<OperationResult> {
        return this.handler.invokeWithMessage<GroupMessage>({
            groupCommand: GroupCommand.leave,
            groupId
        });
    }

    addToGroup(nicknames: string[], groupId: string): Promise<OperationResult> {
        return this.handler.invokeWithMessage<GroupMessage>({
            groupCommand: GroupCommand.addOthers,
            groupId,
            targets: nicknames
        });
    }

    joinGroup(groupId: string): Promise<OperationResult> {
        return this.handler.invokeWithMessage<GroupMessage>({
            groupCommand: GroupCommand.join,
            groupId
        });
    }
}