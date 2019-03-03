let claimId = 0;
export class Claim {

    name: string;
    claims: Claim[];
    constructor(name?: string) {
        if (!name) {
            name = claimId++ + '';
        }
    }

    subClaims(claims: Claim[]): this {
        this.claims = claims;
        return this;
    }

    haveClaim(claim: Claim): boolean {
        return this.claims.some(c => c.name === claim.name);
    }

    ToString() {
        return this.name;
    }
}

function claim(subClaims?: { [key: string]: Claim }) {
    let allSubClaims: Claim[] = [];
    if (subClaims) {
        for (let subClaim in subClaims) {
            allSubClaims.push(subClaims[subClaim]);
        }

        return new Claim().subClaims(allSubClaims);
    }
}

export function haveClaim(claims: Claim[], claim: Claim): boolean {
    return claims.some(c => c.haveClaim(claim));
}

export namespace Claims {
    export const joinSession = claim();
    export const createSession = claim();
    
    export const rootUser = claim({ joinSession, createSession });
}
