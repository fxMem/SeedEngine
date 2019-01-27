export enum Claims {
    createSession,
    rootUser

    // split to Claims & Roles
}


export interface UserClaims {
    [key: string]: any;
}

