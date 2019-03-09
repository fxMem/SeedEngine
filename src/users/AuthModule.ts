import { AuthMethod } from './AuthMethod';
import { UserStorage } from "./UserStorage";
import { UserManager } from './Users';
import { createLocalLogScope } from '@log';
import { User, DefaultUser } from './User';

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
            throw new Error(`Requested authentification module with id = ${authData.moduleId} is not found!`);
        }

        let user = await selectedModule.tryAuthentificate(authData, (nickname) => this.userStorage.getData(nickname));

        // checking for existing login here to avoid race conditions
        let existingUser = this.getExistingUser(userTransportId);
        if (existingUser) {
            throw new Error(`User with id = ${userTransportId} is alredy online!`);
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
