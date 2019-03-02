import { Client } from "../client/Client";

localStorage.debug = '*';


console.log('piglet');

let client = new Client();
client.connect().then(async () => {
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
    
    client.onMessage(async (message) => {
    
        let handler = handlers[message.header];
        if (!handler)
            throw new Error('Handler not found!');
    
        handlers[message.header](message.payload);
    });
    
    let authResult = await client.authenticate('0', { nickname: 'root', password: 'root' });
    if (!authResult) {
        throw new Error('Cant authorize');
    }

});

