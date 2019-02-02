import { AuthMethod, User } from "./AuthMethod";
import { Claims } from "./Claims";
import { IdentityChecker } from "./IdentityChecker";

export class SimpleAuthModule implements AuthMethod {
    constructor(private identityChecker: IdentityChecker) {

    }

    getDescription(): string {
        return "Simple authentification requiring only to provide nickname.";
    }

    async tryAuthentificate(authData: any, storeLoader: (nickname: string) => any): Promise<User> {
        let { nickname } = authData;
        if (!nickname) {
            throw new Error('Provided user information lacks nickname!');
        }

        let userData = storeLoader(nickname);

        if (userData && Claims.rootUser in userData.claims) {
            let realRoot = await this.identityChecker.check(authData, userData);
            if (realRoot) {
                return { nickname: nickname, data: userData };
            }
            else {
                return null;
            }
        }

        return { nickname, data: userData || { claims: {} } };
    }
}
