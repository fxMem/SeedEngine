import { User } from "@core";

export interface MessageCallback {
    (message: Message): Promise<any>;
}

export interface MessageHandler {
    (message: Message, next: MessageCallback): Promise<any>;
}

export interface SpecificMessageTypeHandler {
    canHandle(message: Message): boolean;

    handle(message: Message): Promise<any>;
}

export interface MessagePipeline {
    chain(handler: MessageHandler): MessagePipeline;

    build(): MessageCallback;
}

export interface Message {
    user: User;
}

export class DefaulMessagePipeline implements MessagePipeline {
    private callbacks: MessageHandler[];

    build(): MessageCallback {
        let result: MessageCallback = (_) => Promise.resolve();

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
            (message: any, next: MessageCallback): Promise<any> => {
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



