import { MessageContext, Message, MessageHandler, MessagePipelineCallback } from "./MessagePipeline";

export interface SpecificMessageTypeHandler {
    canHandle(message: Message): boolean;

    handle(context: MessageContext): Promise<any>;
}

export function makeRegularHandler(handler: SpecificMessageTypeHandler): MessageHandler {
    return (context: MessageContext, next: MessagePipelineCallback): Promise<any> => {
        if (handler.canHandle(context.message)) {
            return handler.handle(context);
        }
        else {
            return next(context);
        }
    }
}