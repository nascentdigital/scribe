
// types
export type LogNamespace = string;

export type LogLevel = "silent" | "trace" | "debug" | "info" | "warn" | "error";
export const LogLevels: ReadonlyArray<LogLevel> = [
    "silent",
    "trace",
    "debug",
    "info",
    "warn",
    "error"
];
export type LogMethod = Exclude<LogLevel, "silent">;

export type LogParameter = string | number | boolean | ReadonlyArray<any> | Readonly<any> | undefined;
export type LogFunction = (log: Log, method: LogMethod, message: LogParameter, ...args: ReadonlyArray<LogParameter>) => void;


// interface definition
export interface Log {

    readonly namespace: LogNamespace;

    readonly level: LogLevel;

    trace(message: LogParameter, ...args: LogParameter[]): void;

    debug(message: LogParameter, ...args: LogParameter[]): void;

    info(message: LogParameter, ...args: LogParameter[]): void;

    warn(message: LogParameter, ...args: LogParameter[]): void;

    error(message: LogParameter, ...args: LogParameter[]): void;
}

