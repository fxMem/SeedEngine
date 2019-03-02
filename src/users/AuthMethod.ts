import { UserInfo } from './UserStorage';
import { User } from './User';



export interface AuthMethod {
    getDescription(): string;

    tryAuthentificate(authData: any, storedDataLoader: (nickname: string)
        => Promise<UserInfo>): Promise<{ nickname: string, data: any }>;
}