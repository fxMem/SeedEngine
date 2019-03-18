import { SpecificMessageTypeHandler, Message, MessageContext, ServerError } from "@transport";
import { isGroupMessage, GroupCommand } from "./GroupMessage";
import { GroupManager } from "./GroupManager";
import { Success, OperationResult } from "@core";


export class GroupPipeline implements SpecificMessageTypeHandler {

    name: 'groupHandler';
    constructor(private groupManager: GroupManager) {

    }

    canHandle(message: Message): boolean {
        return isGroupMessage(message);
    }

    async handle(context: MessageContext): Promise<any> {
        let { message, from } = context;

        if (!isGroupMessage(message)) {
            throw new ServerError('Incorrect message type for ChatPipeline!');
        }

        let { groupCommand } = message;

        switch (groupCommand) {
            case GroupCommand.create:
                let group = this.groupManager.createGroup(message.targets);
                return { groupId: group.id };
            case GroupCommand.join:
                this.groupManager.addUsers([from.nickname], message.groupId);
                break;
            case GroupCommand.addOthers:
                this.groupManager.addUsers(message.targets, message.groupId);
                break;
            case GroupCommand.leave:
                this.groupManager.leaveGroup(from, message.groupId);
                break;
            default:
                throw new ServerError(`Unknown chat command: ${groupCommand}`);
        }

        return Success;
    }


}