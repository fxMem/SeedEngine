import { createServer } from 'http';
import * as express from 'express';
import { Log } from '@log';

export interface HttpFacade {
    listen(port: number, callback: (error: any) => void): void;
}

export interface HttpFacadeFactory {
    create(log: Log): HttpFacade;
}

export class ExpressFacadeFactory implements HttpFacadeFactory {

    create(log: Log): HttpFacade {
        let expressApp = express();
        this.setupExpress(expressApp);

        let httpServer = createServer(expressApp);
        return httpServer;
    }

    private setupExpress(app: express.Express): void {
        app.get('/', (req, res) => {

        });
    }
}