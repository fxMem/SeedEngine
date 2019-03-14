import { MessagePipeline, MessageHandler, MessagePipelineCallback } from "./MessagePipeline";
import { createLocalLogScope } from "@log";

export class DefaulMessagePipeline implements MessagePipeline {
    private log = createLocalLogScope(nameof(DefaulMessagePipeline));
    private callbacks: MessageHandler[] = [];

    build(): MessagePipelineCallback {
        let result: MessagePipelineCallback = (_) => Promise.resolve(null);

        let messageNumber = 0;
        this.chain(async (context, next) => {
            this.log.info(`#${messageNumber} Recieved message = ${JSON.stringify(context.message)}`);
            let resultValue = await next(context);
            this.log.info(`#${messageNumber++} procceded, result = ${JSON.stringify(resultValue)}`);

            return resultValue;
        });

        for (let i = 0; i < this.callbacks.length; i++) {
            let nextArgument = result;
            let callback = this.callbacks[i];
            if (callback.handlerName) {
                result = (context) => { 
                    this.log.info(`Invoking handler: ${callback.handlerName}`);
                    return callback(context, nextArgument);
                };
            }
            else {
                result = (context) => callback(context, nextArgument);
            }
        }

        return result;
    }

    chain(handler: MessageHandler): this {
        this.callbacks.push(handler);
        return this;
    }
}