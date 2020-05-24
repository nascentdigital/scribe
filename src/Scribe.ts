// imports
import {ArgumentError, NotImplementedError} from "@nascentdigital/errors";
import {ConsoleLogFunction} from "./ConsoleLogFunction";
import {
    Log,
    LogFunction,
    LogLevel,
    LogLevels,
    LogMethod,
    LogNamespace,
    LogParameter
} from "./Log";
import {ScribeLog} from "./ScribeLog";


// constants
const ROOT_NAMESPACE = "";
const ROOT_LOG_CONFIG: [LogNamespacePattern, LogLevel] = ["*", "error"];
const NAMESPACE_MATCH = new RegExp(/^(\w+)((:\w+)(\/\w+)*)?$/);
const NAMESPACE_PATTERN_MATCH = new RegExp(/^[\w\/:\*]+$/);


// types
export type LogNamespacePattern = string;


// class definition
export class Scribe {

    public static readonly log: Log = new ScribeLog(ROOT_NAMESPACE, ROOT_LOG_CONFIG[1], Scribe.logProxy);

    private static readonly _logs = new Map<LogNamespace, ScribeLog>();
    private static readonly _levelConfig: Array<[LogNamespacePattern, LogLevel]> = [ROOT_LOG_CONFIG];

    private static _logFunction: LogFunction = ConsoleLogFunction;


    public static getLog(namespace: LogNamespace): Log {

        // TODO: validate the namespace
        if (!namespace) {
            throw new ArgumentError("namespace",
                "A namespace must be provided when acquiring logs.");
        }

        else if (!namespace.match(NAMESPACE_MATCH)) {

            // TODO: update the error mesasge to point to the docs
            throw new ArgumentError("namespacePattern",
                "Invalid namespace (see ...).");
        }

        // use cached log, or create one
        let log = this._logs.get(namespace)
        if (!log) {

            // create new log
            log = new ScribeLog(namespace, this.getLogLevel(namespace), this.logProxy);

            // map the log
            this._logs.set(namespace, log);
        }

        // return log
        return log;
    }

    public static setLogLevel(namespacePattern: LogNamespacePattern,  level: LogLevel) {

        // throw if pattern is invalid
        const matches = [...namespacePattern.matchAll(NAMESPACE_PATTERN_MATCH)];
        if (!matches || matches.length === 0) {

            //
            throw new ArgumentError("namespacePattern",
                "Invalid namespace pattern (see ...).");
        }

        // TODO: remove exact pattern match

        // TODO: update all the existing logs
        throw new NotImplementedError("");
    }

    private static getLogLevel(namespace: LogNamespace): LogLevel {

        // FIXME: this is nonsense
        return "warn";
    }

    private static logProxy(log: Log, method: LogMethod, message: LogParameter,
                            ...args: ReadonlyArray<LogParameter>) {

        // only log if level is high enough for method
        const level = log.level;
        if (LogLevels.indexOf(level) >= LogLevels.indexOf(method)) {
            Scribe._logFunction(log, method, message, ...args);
        }
    }
}
