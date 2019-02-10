import { Action } from "@utils";

export type TransportMessageCallbackAsync = (message: TransportMessage) => Promise<any>;
export type TransportMessageCallback = (message: TransportMessage) => void;
export type TransportLifetimeCallback = (TransportClientId: string) => Promise<void>;

export type TransportMessage = {
    header: string,
    payload: any,
} & TransportMessageOptions;

export type TransportMessageOptions = {
    hash?: string
}

export interface Transport {
    start(): void;
    isStarted(): boolean;

    onConnected(userCallback: (client: Connected) => void): void;
    send(message: TransportMessage): void;
}

export type Connected = {
    id: string;
    onMessage: (callback: TransportMessageCallbackAsync) => void;
    onDisconnected: (callback: Action) => void;
}