import { User, Users } from "@users";
import { Log, LogFriendly } from "@log";
import { MessageSender } from "./MessageSender";

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
}

export interface MessagePipeline {
    chain(handler: MessageHandler): MessagePipeline;

    build(log?: Log): MessagePipelineCallback;
}

export interface Message {

}

export class DefaulMessagePipeline implements MessagePipeline {
    private callbacks: MessageHandler[] = [];

    build(log?: Log): MessagePipelineCallback {
        let result: MessagePipelineCallback = (_) => Promise.resolve(null);

        if (log) {
            let messageNumber = 0;
            this.chain(async (context, next) => {
                log.info(`#${messageNumber} Recieved message = ${JSON.stringify(context.message)}`);
                let resultValue = await next(context);
                log.info(`#${messageNumber++} procceded, result = ${JSON.stringify(resultValue)}`);

                return resultValue;
            });
        }

        for (let i = 0; i < this.callbacks.length; i++) {
            let nextArgument = result;
            let callback = this.callbacks[i];
            result = (context) => callback(context, nextArgument);
        }

        return result;
    }

    chain(handler: MessageHandler): this {
        this.callbacks.push(handler);
        return this;
    }
}



