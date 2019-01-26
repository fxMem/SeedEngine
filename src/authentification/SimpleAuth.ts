import { AuthModule } from "./AuthModule";
import { User } from "@core";


export class SimpleAuthModule implements AuthModule {
    getDescription(): string {
        return "Simple authentification requiring only to provide nickname.";
    }

    tryAuthentificate(authData: any): Promise<User> {
        return authData.nickname && Promise.resolve({ nickname: authData.nickname });
    }
}