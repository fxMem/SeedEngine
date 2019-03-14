import { MessagePipeline, MessageHandler, MessagePipelineCallback } from "./MessagePipeline";
import { createLocalLogScope } from "@log";

export class DefaulMessagePipeline implements MessagePipeline {
    private log = createLocalLogScope(nameof(DefaulMessagePipeline));
    private callbacks: (() => MessageHandler[])[] = [];

    build(): MessagePipelineCallback {
        let result: MessagePipelineCallback = (_) => Promise.resolve(null);

        let messageNumber = 0;
        this.chain(() => [async (context, next) => {
            this.log.info(`#${messageNumber} Recieved message = ${JSON.stringify(context.message)}`);
            let resultValue = await next(context);
            this.log.info(`#${messageNumber++} procceded, result = ${JSON.stringify(resultValue)}`);

            return resultValue;
        }]);

        for (let callback of this.callbacks) {
            let handlers = callback();

            for (let handler of handlers) {
                let nextArgument = result;
                if (handler.handlerName) {
                    result = (context) => { 
                        this.log.info(`Invoking handler: ${handler.handlerName}`);
                        return handler(context, nextArgument);
                    };
                }
                else {
                    result = (context) => handler(context, nextArgument);
                }
            }
            
        }

        return result;
    }

    chain(callback: () => MessageHandler[]): this {
        this.callbacks.push(callback);
        return this;
    }
}