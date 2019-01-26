import {UserManager, User} from "@core";
import {AuthModule} from '@auth';

export class HandshakeModule {
   
    constructor(private userManager: UserManager, private authModules: AuthModule[]) {
        
    }

    identifyUser(userTransportId: string) : User | HandshakeInvite {
        let user = this.userManager.getUser(userTransportId);
        return user || new HandshakeInvite(this.authModules.map((m, i) => ({
            id: i.toString(),
            description: m.getDescription()
        })));
    }

    disconnectUser(userTransportId: string): void {
        this.userManager.disconnect(userTransportId);
    }

    async authentificate(userTransportId: string, authData: {moduleId: string}): Promise<boolean> {
        let selectedModule = this.authModules[+authData.moduleId];
        if (!selectedModule) {
            throw new Error(`Requested authentification module with id = ${authData.moduleId} is not found!`);
        }

        let user = await selectedModule.tryAuthentificate(authData);
        if (user) {
            this.userManager.connect(userTransportId, user);    
        }
        
        return !!user;
    }
}

export class HandshakeInvite {
    constructor(public availableAuthModules: {id: string, description: string}[]) {
        
    }
}
