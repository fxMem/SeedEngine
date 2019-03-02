import { UserInfo } from "./UserStorage";

export interface User {
    id: string;

    nickname: string;

    data: UserInfo;
}

