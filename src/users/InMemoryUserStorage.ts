import { UserStorage, UserInfo } from "./UserStorage";

export class InMemoryUserStorage implements UserStorage {
    private users: Map<string, UserInfo>;

    constructor() {
        this.users = new Map();
    }

    getData(nickname: string): Promise<UserInfo> {
        return Promise.resolve(this.users.get(nickname));
    }

    setData(nickname: string, userInfo: UserInfo): void {
        this.users.set(nickname, userInfo);
    }


}