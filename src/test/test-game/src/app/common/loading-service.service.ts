import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ErrorCode } from 'seedengine.client/transport/ErrorCodes';
import { ServerError } from 'seedengine.client/transport/ServerError';


type Status = { pending: boolean, error?: string, code?: ErrorCode };

@Injectable({
    providedIn: 'root'
})
export class PendingService {

    private operations$ = new Subject<Status>();
    private lastOperationCount = 0;

    constructor() { }

    getPending(): Observable<Status> {
        return this.operations$;
    }


    async reportProgress<T>(input: Promise<T>): Promise<T> {
        this.reportStartPending();
        try {
            let result = await input;
            this.reportEndPending();
            return result;
        }
        catch (e) {
            let serverError = e as ServerError;
            this.reportEndPending({ error: (serverError).message, code: serverError.code });

            throw e;
        }
    }

    private reportStartPending() {
        this.lastOperationCount++;
        if (this.lastOperationCount === 1) {
            this.operations$.next({ pending: true });
        }
    }

    private reportEndPending(data?: { error, code }) {
        const { error = null, code = null } = data || {};
        this.lastOperationCount--;
        if (this.lastOperationCount === 0) {
            this.operations$.next({ pending: false, error, code });
        }
        else if (error) {
            this.operations$.next({ pending: true, error, code });
        }
    }

}
