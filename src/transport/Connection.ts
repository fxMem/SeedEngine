import * as socketIO from 'socket.io';
import { SeedMessage } from './Headers';
import { HttpFacade } from './HttpFacade';

const responseTimeout = 1000 * 5;
export type ConnectedClient = {
    id: string;
    onMessage: (callback: messageCallback) => void;
    onDisconnected: (callback: () => void) => void;
}

type messageCallback = (data: { header: string, payload: any }) => any;

// Wraps socket.IO connection
export class Connection {
    private clientConnection: socketIO.Socket;
    private returnHandles = new ReturnHandlesCollection();
    private ioServer: socketIO.Server;

    constructor(private httpFacade: HttpFacade) {
        this.ioServer = socketIO(this.httpFacade);
    }

    onConnected(userCallback: (client: ConnectedClient) => void) {
        let messageCallback: messageCallback;
        let disconnectedCallback: () => void;

        this.ioServer.on('connection', (socketClient) => {
            userCallback({
                id: socketClient.id,
                onMessage: (callback) => {
                    messageCallback = callback;
                },
                onDisconnected: (callback) => {
                    disconnectedCallback = callback;
                }
            });

            socketClient.on(SeedMessage, this.enableRPC(async data => {
                return messageCallback({ ...data });
            }));

            socketClient.on('disconnect', () => {
                disconnectedCallback();
            });
        });
    }


    send(header: string, data: any, options: any): void {
        this.clientConnection.emit(SeedMessage, {
            header,
            data,
            ...options
        });
    }

    // This functions sends message and waits for responce
    sendAndGetResult(header: string, data: any): Promise<any> {
        let hash = Math.random() + '';
        this.send(header, data, { hash });

        let timeoutHandle = setTimeout((header, hash) => {
            let callback = this.returnHandles.popCallbacks(header, hash);
            callback && callback.reject();
        }, responseTimeout, header, hash);

        return new Promise((resolve, reject) => {
            this.returnHandles.saveCallbacks(header, hash, (data) => {
                clearTimeout(timeoutHandle);

                resolve(data);
            }, reject);
        });
    }

    // This wrapper is for use with event listeners, like server.on('eventName', enableRPC(actualCallback))
    // It adds ability to return value which later on would be sent back to client
    private enableRPC(callback: (data: any) => Promise<any>): (data: any) => void {
        return (data) => {
            let { header, hash, payload } = data;

            // Case 1, arrived message contains return value for invocation made earlier, 
            // so we try to resolve corresponding promise
            if (hash && this.tryFullfillReturn(header, hash, payload)) {
                return;
            }

            // Case 2, it's a fresh invocation so we invoke user logic, 
            // then dispatch result to client, if any
            callback(data).then((result => {
                if (result) {
                    this.send(header, result, { hash });
                }
            }), (error) => {
                // TODO: log, etc
            });
        };
    }

    private tryFullfillReturn(header: string, hash: string, data: any): boolean {
        let existingWaiter = this.returnHandles.popCallbacks(header, hash);
        existingWaiter && existingWaiter.resolve(data);

        return !!existingWaiter;
    }
}

type promiseCallbacks = { resolve: (value: any) => void, reject: () => void };
class ReturnHandlesCollection {
    private returnHandles: Map<string, promiseCallbacks>;

    private getResolveCallbackKey(header: string, hash: string): string {
        return header + hash;
    }

    popCallbacks(header: string, hash: string): promiseCallbacks {
        let key = this.getResolveCallbackKey(header, hash);
        let callbacks = this.returnHandles.get(key);
        this.returnHandles.delete(key);

        return callbacks;
    }

    saveCallbacks(header: string, hash: string, resolve: (value: any) => void, reject: () => void): void {
        this.returnHandles.set(this.getResolveCallbackKey(header, hash), { resolve, reject });
    }
}