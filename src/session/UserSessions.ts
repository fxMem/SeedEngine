import { getUserInfoArray, UserInfoArray } from "../users/UserInfoArray";
import { User } from "../users/User";

const userSessionsKey = '__sessions';

export function getUserSessions(user: User): UserInfoArray<string> {
    return getUserInfoArray<string>(user, userSessionsKey);
}