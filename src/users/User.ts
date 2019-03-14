import { UserInfo } from "./UserStorage";
import { Claim, haveClaim } from "./Claims";

export type nickname = string;
export type userId = string;

export interface User {
    id: userId;

    nickname: nickname;

    data: UserInfo;

    haveClaim(claim: Claim): boolean;
}

export class DefaultUser implements User {

    constructor(public id: string, public nickname: string, public data: UserInfo = { claims: {} }) {

    }

    haveClaim(claim: Claim): boolean {
        return haveClaim(this.data.claims, claim);
    }

    toString() {
        return `${this.nickname}[${this.id}]`;
    }
}

