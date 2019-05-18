import { User } from "./User";

function defaultEquals(a: any, b: any): boolean {
    return a == b;
}

// TODO: cache returned instances so not to create too many objects
export function getUserInfoArray<T>(user: User, key: string, equals?: (a: T, b: T) => boolean): UserInfoArray<T> {
    let existingData = user.data[key];
    if (!existingData) {
        existingData = [];
        user.data[key] = existingData;
    }

    return new UserInfoArray<T>(key, user, existingData, equals || defaultEquals);
}

export class UserInfoArray<T> {

    constructor(private key: string, public user: User, public values: T[], private equals: (a: T, b: T) => boolean) {

    }

    remove(value: T) {
        this.values = this.values.filter(v => !this.equals(v, value));
        this.user.data[this.key] = this.values;
    }

    add(value: T) {
        this.values.push(value);
    }
}
