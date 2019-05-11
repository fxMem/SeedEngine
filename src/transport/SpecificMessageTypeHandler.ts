import { MessageContext, MessageHandler, MessagePipelineCallback } from "./MessagePipeline";
import { Message } from "./Message";

export interface SpecificMessageTypeHandler {

    name?: string;

    canHandle(message: MessageContext): boolean;

    handle(context: MessageContext): Promise<any>;
}

export function makeRegularHandler(handler: SpecificMessageTypeHandler): MessageHandler {
    let callbackHandler: MessageHandler = (context: MessageContext, next: MessagePipelineCallback): Promise<any> => {
        if (handler.canHandle(context)) {
            return handler.handle(context);
        }
        else {
            return next(context);
        }
    }
    
    callbackHandler.handlerName = handler.name;
    return callbackHandler;
}