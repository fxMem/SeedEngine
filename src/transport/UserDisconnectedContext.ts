import { MessageContext } from "./MessagePipeline";
import { Message } from "./Message";
import { User } from "../users/User";
import { Users } from "../users/Users";
import { MessageSender } from "./MessageSender";

// This object passed to pipeline when user disconnects, naturally its
// message property is null. There was another possibiilty to handle diconeectes - 
// pass them via UserManager. It would requre though to implement separete wiring for
// disconnect event 'subscribers' so now I take approach to reuse 'Pipeline's system
export class UserDisconnectedContext implements MessageContext {
    message: Message;    
    
    constructor(public from: User, public users: Users, public sender: MessageSender) {
        
    }
}