export enum LogLevel {
    verbose,
    warn,
    error
}

export class Log {

    constructor () {
        
    }

    info(message: string) {

    }

    warn(message: string) {

    }

    error(message: string) {

    }
}

export interface Logger {
    log(level: LogLevel, message: string);
}

export class DefaultConsoleLogger implements Logger {
    log(level: LogLevel, message: string) {
        console.log("");
    }

}