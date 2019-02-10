import { TransportMessageCallback, TransportMessageOptions, TransportMessageCallbackAsync } from "./Transport";

const responseTimeout = 1000 * 5;

// Wraps logic of remote calls
export class MessageSender {

    private returnHandles = new ReturnHandlesCollection();

    constructor(private sendCallback: TransportMessageCallback) {

    }

    private internalSend(header: string, payload: any, options?: TransportMessageOptions): void {
        this.sendCallback({
            header,
            payload,
            ...options
        });
    }

    send(header: string, payload: any): void {
        this.internalSend(header, payload);
    }

    // This functions sends message and waits for responce
    sendAndGetResult(header: string, data: any): Promise<any> {
        let hash = Math.random() + '';
        this.internalSend(header, data, { hash });

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
    enableRPC(callback: TransportMessageCallbackAsync): TransportMessageCallbackAsync {
        return (data) => {
            let { header, hash, payload } = data;

            // Case 1, arrived message contains return value for invocation made earlier, 
            // so we try to resolve corresponding promise
            if (hash && this.tryFullfillReturn(header, hash, payload)) {
                return;
            }

            // Case 2, it's a fresh invocation so we invoke user logic, 
            // then dispatch result to client, if any
            return callback(data).then((result => {
                if (result) {
                    this.internalSend(header, result, { hash });
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