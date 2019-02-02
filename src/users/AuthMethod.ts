import {User} from '@core';
import { UserInfo } from './UserStorage';

export interface AuthMethod {
    getDescription(): string;

    tryAuthentificate(authData: any, storedDataLoader: (nickname: string) => Promise<UserInfo>): Promise<User>;
}