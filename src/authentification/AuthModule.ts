import {User} from '@core';

export interface AuthModule {
    getDescription(): string;

    tryAuthentificate(authData: any): Promise<User>;
}