import { Action } from "@utils";
import { ClientMessage } from "./Connection";
import { User } from "@users";
import { MessageTarget } from "./MessageTarget";

export type TransportMessageCallbackAsync = (message: TransportMessage) => Promise<any>;
export type TransportMessageCallback = (message: TransportMessage) => void;
export type TransportLifetimeCallback = (TransportClientId: string) => Promise<void>;
export type TransportConnectedCallback = (client: TransportClient) => void;

export type TransportMessage = ClientMessage & TransportMessageOptions;

export type TransportMessageOptions = {
    hash?: string
}

export interface TransportMessageSender {
    send(message: TransportMessage, options: { broadcast?: boolean, targets: MessageTarget[] }): void;
}

export interface Transport extends TransportMessageSender {
    start(options?: any): void;
    isStarted(): boolean;

    onConnected(userCallback: TransportConnectedCallback): void;
}

export type TransportClient = {
    id: string;
    onMessage: (callback: TransportMessageCallbackAsync) => void;
    onDisconnected: (callback: Action) => void;
}