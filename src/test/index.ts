import { Client } from "../client/Client";

localStorage.debug = '*';


console.log('piglet');

let client = new Client();
client.connect((self) => {

    console.log('connected!');

    let handlers = {
        openTile: (p) => {
            let tiles: [] = p.tiles;
            for (let tile of tiles) {
                let { playerId, tileInfo } = tile;

                // display update
            }
        },

        finish: (p) => {
            let { winner } = p;

            // display scores
        }
    }
    
    self.onMessage(async (message) => {

        let handler = handlers[message.header];
        if (!handler)
            throw new Error('Handler not found!');

        handlers[message.header](message.payload);
    });
});