import { Claims, UserClaims } from "./Claims";

export interface UserInfo {

    claims: UserClaims;
}

export interface UserStorage {
    getData(nickname: string): UserInfo;

    setData(nickname: string, userInfo: UserInfo): void;
}