# SeedEngine

Framework to simplify creation of client-server multiplayer games. Written in JS to allow easy code sharing between game client and server (assuming we using JS to write client). Framework provides means to manage players connect / disconnect, authorization, firing up game sessions, chat platform, lobby logic and other.

Uses TypeScipt, Webpack for building client and server bundles. For data communication [socket.io](https://socket.io) is used.

# Scripts

### Build server
```bash
npm run bs
```

### Build client
```bash
npm run bc
```

For usage examples see included test project [TestGame.ts](https://github.com/fxMem/SeedEngine/blob/master/src/test/TestGame.ts)
