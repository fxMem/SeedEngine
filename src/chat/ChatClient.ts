import { Client, ClientConnectionHandler } from "@client";
import { OperationResult } from "@core";
import { ChatMessage } from "./ChatMessage";

export class ChatClient implements Client {
    handler: ClientConnectionHandler;

    send(target: string, text: string): Promise<OperationResult> {
        return this.handler.invokeWithMessage<ChatMessage>({
            target,
            text
        });
    }
}