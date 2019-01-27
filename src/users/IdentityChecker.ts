export interface IdentityChecker {
    check(providedData: any, knownData: any): Promise<boolean>;
}

export class SimpleIdentityChecker implements IdentityChecker {
    async check(providedData: any, knownData: any): Promise<boolean> {
        let providedPassword = providedData.password;
        let knownPassword = knownData.password;

        // this simple checker don't care about password hashing etc and intended 
        // only for demonstration purposes
        return providedPassword == knownPassword;
    }

}