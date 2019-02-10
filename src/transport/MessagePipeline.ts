import { User } from "@users";
import { Log, LogFriendly } from "@log";

export interface MessagePipelineCallback {
    (message: Message): Promise<any>;
}

export interface MessageHandler {
    (message: Message, next: MessagePipelineCallback): Promise<any>;
}

export interface SpecificMessageTypeHandler {
    canHandle(message: Message): boolean;

    handle(message: Message): Promise<any>;
}

export interface MessagePipeline {
    chain(handler: MessageHandler): MessagePipeline;

    build(): MessagePipelineCallback;
}

export interface Message extends LogFriendly {
    user: User;
}

export class DefaulMessagePipeline implements MessagePipeline {
    private callbacks: MessageHandler[];

    build(log?: Log): MessagePipelineCallback {
        let result: MessagePipelineCallback = (_) => Promise.resolve();

        if (log) {
            let messageNumber = 0;
            this.chain(async (message, next) => {
                log.info(`#${messageNumber} Recieved message = ${message.GetDebugString()}`);
                let result = await next(message);
                log.info(`#${messageNumber++} procceded, result = ${result.GetDebugString()}`);
    
                return result;
            });
        }

        for (let i = this.callbacks.length - 1; i >= 0; i--) {
            let nextCallback = this.callbacks[i];
            result = (message) => nextCallback(message, result);
        }

        return result;
    }

    private chainInternal(handler: MessageHandler): void {
        this.callbacks.push(handler);
    }

    private chainTyped(handler: SpecificMessageTypeHandler): void {
        this.callbacks.push(
            (message: any, next: MessagePipelineCallback): Promise<any> => {
                if (handler.canHandle(message)) {
                    return handler.handle(message);
                }
                else {
                    return next(message);
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



