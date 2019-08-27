import { Message } from "../transport/Message";

export interface LobbyMessage extends Message {
    sessionId: string;
}

export function isLobbyMessage(message: Message): message is LobbyMessage {
    return (message as any).sessionId !== undefined;
}
