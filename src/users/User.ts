import { UserInfo } from "./UserStorage";
import { Claim, haveClaim } from "./Claims";

export interface User {
    id: string;

    nickname: string;

    data: UserInfo;

    haveClaim(claim: Claim): boolean;
}

export class DefaultUser implements User {

    constructor(public id: string, public nickname: string, public data: UserInfo = { claims: {} }) {

    }

    haveClaim(claim: Claim): boolean {
        return haveClaim(this.data.claims, claim);
    }
}

