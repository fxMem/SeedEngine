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

export interface SpecificMessageTypeHandler {
    canHandle(message: Message): boolean;

    handle(context: MessageContext): Promise<any>;
}

export interface MessagePipeline {
    chain(handler: MessageHandler): MessagePipeline;

    build(): MessagePipelineCallback;
}

export interface Message extends LogFriendly {
    
}

export class DefaulMessagePipeline implements MessagePipeline {
    private callbacks: MessageHandler[] = [];

    build(log?: Log): MessagePipelineCallback {
        let result: MessagePipelineCallback = (_) => Promise.resolve();

        if (log) {
            let messageNumber = 0;
            this.chain(async (context, next) => {
                log.info(`#${messageNumber} Recieved message = ${context.message.GetDebugString()}`);
                let result = await next(context);
                log.info(`#${messageNumber++} procceded, result = ${result.GetDebugString()}`);
    
                return result;
            });
        }

        for (let i = this.callbacks.length - 1; i >= 0; i--) {
            let nextCallback = this.callbacks[i];
            result = (context) => nextCallback(context, result);
        }

        return result;
    }

    private chainInternal(handler: MessageHandler): void {
        this.callbacks.push(handler);
    }

    private chainTyped(handler: SpecificMessageTypeHandler): void {
        this.callbacks.push(
            (context: MessageContext, next: MessagePipelineCallback): Promise<any> => {
                if (handler.canHandle(context.message)) {
                    return handler.handle(context);
                }
                else {
                    return next(context);
                }
            }
        );
    }

    chain(handler: MessageHandler | SpecificMessageTypeHandler): MessagePipeline {
        if (nameof<SpecificMessageTypeHandler>(i => i.handle) in handler) {
            this.chainTyped(handler as SpecificMessageTypeHandler);
        }
        else {
            this.chainInternal(handler as MessageHandler)
        }    

        return this;
    }
}



