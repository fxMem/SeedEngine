import { Claims, haveClaim } from "./Claims";
import { UserStorage, UserInfo } from "./UserStorage";
import { IdentityChecker } from "./IdentityChecker";
import { AuthMethod } from "./AuthMethod";
import { ServerError } from "../transport/ServerError";

export namespace SimpleIdentity {

    export function WithSuperUser(storage: UserStorage): UserStorage {
        storage.setData('root', { password: 'root', claims: [Claims.rootUser] } as UserInfo);
        storage.setData('root2', { password: 'root2', claims: [Claims.rootUser] } as UserInfo);
        return storage;
    }

    class SimpleIdentityChecker implements IdentityChecker {
        async check(providedData: any, knownData: any): Promise<boolean> {
            let providedPassword = providedData.password;
            let knownPassword = knownData.password;

            // this simple checker don't care about password hashing etc and intended 
            // only for demonstration purposes
            return providedPassword == knownPassword;
        }
    }

    export class SimpleAuthModule implements AuthMethod {
        private identityChecker = new SimpleIdentityChecker();

        getDescription(): string {
            return "Simple authentification requiring only to provide nickname.";
        }

        async tryAuthentificate(authData: any, storeLoader: (nickname: string) => any): Promise<{ nickname: string, data: any }> {
            let { nickname } = authData;
            if (!nickname) {
                throw new ServerError('Provided user information lacks nickname!');
            }

            let userData = await storeLoader(nickname);

            if (userData && userData.claims && haveClaim(userData.claims, Claims.rootUser)) {
                let realRoot = await this.identityChecker.check(authData, userData);
                if (realRoot) {
                    return { nickname: nickname, data: userData };
                }
                else {
                    return null;
                }
            }

            return { nickname, data: userData || { claims: [Claims.regularUser] } };
        }
    }
}