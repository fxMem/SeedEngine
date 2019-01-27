import {User} from '@core';

export interface AuthMethod {
    getDescription(): string;

    tryAuthentificate(authData: any, storeLoader: (nickname: string) => any): Promise<User>;
}