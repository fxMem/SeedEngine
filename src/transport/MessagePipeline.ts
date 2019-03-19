import { MessageSender } from "./MessageSender";
import { Message } from "./Message";
import { User, Users } from "../users";

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
    chain(factory: () => MessageHandler[]): MessagePipeline;

    build(): MessagePipelineCallback;
}





