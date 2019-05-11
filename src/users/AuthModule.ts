import { AuthMethod } from './AuthMethod';
import { UserStorage } from "./UserStorage";
import { UserManager } from './Users';
import { User, DefaultUser } from './User';
import { isNicknameValid } from './UserValidator';
import { createLocalLogScope } from '../log';
import { ServerError } from '../server';


export class AuthModule {

    private log = createLocalLogScope(nameof(AuthModule));
    constructor
        (
            private userManager: UserManager,
            private authMethods: AuthMethod[],
            private userStorage: UserStorage
        ) { }

    identifyUser(userTransportId: string): User {
        return this.getExistingUser(userTransportId);
    }

    getInvitation(): AuthInvite {
        return new AuthInvite(this.authMethods.map((m, i) => ({
            id: i.toString(),
            description: m.getDescription()
        })));
    }

    disconnectUser(userTransportId: string): void {
        this.userManager.disconnect(userTransportId);
    }

    async authentificate(userTransportId: string, authData: { moduleId: string }): Promise<boolean> {
        let selectedModule = this.authMethods[+authData.moduleId];
        if (!selectedModule) {
            throw new ServerError(`Requested authentification module with id = ${authData.moduleId} is not found!`);
        }

        let user = await selectedModule.tryAuthentificate(authData, (nickname) => this.userStorage.getData(nickname));
        if (!user) {
            throw new ServerError(`Cannot authentificate user by data ${authData}`);
        }
        
        if (!isNicknameValid(user.nickname)) {
            throw new ServerError(`Nickname ${user.nickname} is not valid!`);
        }

        // checking for existing login here to avoid race conditions
        let existingUser = this.getExistingUser(userTransportId);
        if (existingUser) {
            throw new ServerError(`User with id = ${userTransportId} is alredy online!`);
        }

        if (user) {
            this.userManager.connect(userTransportId, new DefaultUser(userTransportId, user.nickname, user.data));
            this.userStorage.setData(user.nickname, user.data);
        }

        this.log.info(`Attempt to authenticate from client #${userTransportId}, result = ${!!user}`);
        return !!user;
    }

    private getExistingUser(userTransportId: string): User {
        return this.userManager.getUserById(userTransportId);
    }
}

export class AuthInvite {
    constructor(public availableAuthModules: { id: string, description: string }[]) {

    }
}
