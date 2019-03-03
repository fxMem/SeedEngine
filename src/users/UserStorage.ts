export interface UserInfo {
    [key: string]: any;
}

export interface UserStorage {
    getData(nickname: string): Promise<UserInfo>;

    setData(nickname: string, userInfo: UserInfo): void;
}