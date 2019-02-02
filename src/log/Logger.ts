export enum LogLevel {
    verbose,
    warn,
    error
}

export class Log {

    constructor(private loggers: Logger[]) {

    }

    info(message: string): void {
        this.log(message, LogLevel.verbose);
    }

    warn(message: string): void {
        this.log(message, LogLevel.warn);
    }

    error(message: string): void {
        this.log(message, LogLevel.error);
    }

    // Simple realization just delegates
    // TODO: make it queue-style
    log(message: string, level: LogLevel): void {
        this.loggers.forEach(l => l.log(level, message));
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