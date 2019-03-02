import { UserInfo } from "./UserStorage";
import { UserClaims, Claims } from "./Claims";

export interface User {
    id: string;

    nickname: string;

    data: UserInfo;

    haveClaim(claim: Claims): boolean;
}

export class DefaultUser implements User {

    constructor(public id: string, public nickname: string, public data: UserInfo = { claims: {} }) {

    }

    haveClaim(claim: Claims): boolean {
        return claim in this.data.claims;
    }
}

