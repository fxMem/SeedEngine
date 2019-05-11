import { MessageContext, Message, User, Users, MessageSender } from "../server";

export class UserDisconnectedContext implements MessageContext {
    message: Message;    
    
    constructor(public from: User, public users: Users, public sender: MessageSender) {
        
    }
}