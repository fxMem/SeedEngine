import { User, Users } from "@users";
import { createLocalLogScope } from "@log";
import { MessageSender } from "./MessageSender";
import { Message } from "./Message";

export interface MessageContext {
    message: Message;
    from: User;

    users: Users;
    sender: MessageSender;
}

export interface MessagePipelineCallback {
    (context: MessageContext): Promise<any>;
}

export interface MessageHandler {
    (context: MessageContext, next: MessagePipelineCallback): Promise<any>;

    handlerName?: string;
}

export interface MessagePipeline {
    chain(handler: MessageHandler): MessagePipeline;

    build(): MessagePipelineCallback;
}





