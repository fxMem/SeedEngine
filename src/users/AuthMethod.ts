import { UserInfo } from './UserStorage';

export interface User {
    nickname: string;

    data: UserInfo;
}

export interface AuthMethod {
    getDescription(): string;

    tryAuthentificate(authData: any, storedDataLoader: (nickname: string) => Promise<UserInfo>): Promise<User>;
}