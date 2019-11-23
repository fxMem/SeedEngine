import { Transport } from "../transport/Transport";
export type TransportConnectionErrorCallback = () => void;

export interface ClientTransport extends Transport {
    onConnectionError(userCallback: TransportConnectionErrorCallback): void;
}