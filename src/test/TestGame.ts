import { Game } from "@game";
import { Session } from "@session/Session";


export class TestGameFacade implements Game {
    create(session: Session): void {
        let game = new TestGame();

        session.subscribe({
            playerJoin: async (player) => {

            },
            playerLeave: async (player) => {

            },
            message: async (message, from) => {
                let { guess } = message;
                game.guess(guess, from.nickname);
            },
            started: () => {
                game.thinkNumber();
            }
        })
    }
}

class TestGame {

    private num: number;
    constructor() {

    }

    thinkNumber() {
        this.num = 42;
    }

    guess(num: number, from: string) {
        if (this.num == num) {
            console.log(`Good one ${from}, it's right!`);
        }
        else {
            console.log(`Not this time, ${from}...`);
        }
    }
}