// imports
import {
    Log,
    LogWriter,
    LogLevel,
    LogNamespace,
    LogParameter
} from "./Log";


// class definition
export class ScribeLog implements Log {

    public readonly namespace: LogNamespace;

    private _level: LogLevel;
    private readonly _logFn: LogWriter;


    public constructor(namespace: LogNamespace, level: LogLevel, logFn: LogWriter) {
        this.namespace = namespace;
        this._level = level;
        this._logFn = logFn;
    }

    public get level() { return this._level; }

    public set level(value: LogLevel) { this._level = value; }


    public trace(message: LogParameter, ...args: LogParameter[]) {
        this._logFn(this, "trace", message, ...args);
    }

    public debug(message: LogParameter, ...args: LogParameter[]) {
        this._logFn(this, "debug", message, ...args);
    }

    public info(message: LogParameter, ...args: LogParameter[]) {
        this._logFn(this, "info", message, ...args);
    }

    public warn(message: LogParameter, ...args: LogParameter[]) {
        this._logFn(this, "warn", message, ...args);
    }

    public error(message: LogParameter, ...args: LogParameter[]) {
        this._logFn(this, "error", message, ...args);
    }
}

