let claimId = 0;
export class Claim {

    name: string;
    claims: Claim[];
    constructor(name?: string) {
        this.name = name || claimId++ + '';
    }

    subClaims(claims: Claim[]): this {
        this.claims = claims;
        return this;
    }

    haveClaim(claim: Claim): boolean {
        return this.name == claim.name || (this.claims && this.claims.some(c => c.haveClaim(claim)));
    }

    ToString() {
        return `${this.name}[${this.claims.toString()}]`;
    }
}

function claim(subClaims?: { [key: string]: Claim }): Claim {
    let allSubClaims: Claim[] = [];
    if (subClaims) {
        for (let subClaim in subClaims) {
            allSubClaims.push(subClaims[subClaim]);
        }
    }

    return new Claim().subClaims(allSubClaims);
}

export function haveClaim(claims: Claim[], claim: Claim): boolean {
    return claims.some(c => c.haveClaim(claim));
}

export namespace Claims {
    export const joinSession = claim();
    export const createSession = claim();
    export const viewSessionList = claim();
    const commonClaims = claim({ joinSession, viewSessionList });

    export const rootUser = claim({ commonClaims, createSession });
    export const regularUser = claim({ commonClaims })
}
