import { AuthMethod } from './AuthMethod';
import { UserStorage } from "./UserStorage";
import { Users } from './Users';
import { Log } from '@log';
import { User } from './User';

export class AuthModule {

    constructor
        (
            private userManager: Users,
            private authMethods: AuthMethod[],
            private userStorage: UserStorage,
            private log: Log
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
            this.userManager.connect(userTransportId, { ...user, id: userTransportId });
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
