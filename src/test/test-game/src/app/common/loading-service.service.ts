import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ServerError } from 'seedengine.client/server';
import { ErrorCode } from 'seedengine.client/transport/ErrorCodes';


type Status = { pending: boolean, error?: string, code?: ErrorCode };

@Injectable({
  providedIn: 'root'
})
export class PendingService {
  
  private operations$ = new Subject<Status>();
  

  constructor() { }

  getPending(): Observable<Status> {
    return this.operations$;
  }


  async reportProgress<T>(input: Promise<T>): Promise<T> {
    this.operations$.next({ pending: true });
    try {
      let result = await input;
      this.operations$.next({ pending: false });
      return result;
    }
    catch (e) {
      let serverError = e as ServerError;
      this.operations$.next({ pending: false, error: (serverError).message, code: serverError.code });
      throw e;
    }
  }

}
