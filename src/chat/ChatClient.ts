import { ChatMessage } from "./ChatMessage";
import { Client, ClientConnectionHandler } from "../client/ClientConnectionHandler";
import { OperationResult } from "../core/OperationResult";

export class ChatClient implements Client {
    handler: ClientConnectionHandler;

    sendToUser(userNickname: string, text: string): Promise<OperationResult> {
        return this.handler.invokeWithMessage<ChatMessage>({
            targetUer: userNickname,
            text
        });
    }

    sendToGroup(groupId: string, text: string): Promise<OperationResult> {
        return this.handler.invokeWithMessage<ChatMessage>({
            targetGroup: groupId,
            text
        });
    }
}