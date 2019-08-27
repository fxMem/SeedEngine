import { createServer } from 'http';
import * as express from 'express';
import { createLocalLogScope } from '../log/LoggerScopes';

export interface HttpFacade {
    listen(port: number, callback: (error: any) => void): void;
}

export interface HttpFacadeFactory {
    create(): HttpFacade;
}

export class ExpressFacadeFactory implements HttpFacadeFactory {

    private log = createLocalLogScope('ExpressFacade');

    create(): HttpFacade {
        let expressApp = express();
        this.setupExpress(expressApp);

        let httpServer = createServer(expressApp);
        httpServer.on('error', (e) => {
            this.log.error(e.name + e.message + e.stack);
        });
        httpServer.on('listening', () => {
            this.log.info('ExpressFacade is listening');
        });

        return httpServer;
    }

    private setupExpress(app: express.Express): void {
        app.get('/', (req, res) => {

        });
    }
}