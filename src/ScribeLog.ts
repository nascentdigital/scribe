// imports
import {
    Log,
    LogFunction,
    LogLevel,
    LogNamespace,
    LogParameter
} from "./Log";


// class definition
export class ScribeLog implements Log {

    public readonly namespace: LogNamespace;

    private _level: LogLevel;
    private readonly _logFunction: LogFunction;


    public constructor(namespace: LogNamespace, level: LogLevel, logFunction: LogFunction) {
        this.namespace = namespace;
        this._level = level;
        this._logFunction = logFunction;
    }

    public get level() { return this._level; }

    public set level(value: LogLevel) { this._level = value; }


    public trace(message: LogParameter, ...args: LogParameter[]) {
        this._logFunction(this, "trace", message, ...args);
    }

    public debug(message: LogParameter, ...args: LogParameter[]) {
        this._logFunction(this, "debug", message, ...args);
    }

    public info(message: LogParameter, ...args: LogParameter[]) {
        this._logFunction(this, "info", message, ...args);
    }

    public warn(message: LogParameter, ...args: LogParameter[]) {
        this._logFunction(this, "warn", message, ...args);
    }

    public error(message: LogParameter, ...args: LogParameter[]) {
        this._logFunction(this, "error", message, ...args);
    }
}

