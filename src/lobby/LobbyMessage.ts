import { Message } from "@transport";

export interface LobbyMessage extends Message {
    sessionId: string;
}

export function isLobbyMessage(message: Message): message is LobbyMessage {
    return (message as any).sessionId !== undefined;
}
