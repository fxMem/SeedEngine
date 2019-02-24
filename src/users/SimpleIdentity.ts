import { IdentityChecker, AuthMethod, User } from "@users";
import { Claims } from "./Claims";
import { UserStorage, UserInfo } from "./UserStorage";
import { InMemoryUserStorage } from "./InMemoryUserStorage";

export namespace SimpleIdentity {

    export function WithSuperUser(storage: UserStorage): UserStorage {
        storage.setData('root', {} as UserInfo);
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
}