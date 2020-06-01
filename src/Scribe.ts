// imports
import {ArgumentError, IllegalStateError} from "@nascentdigital/errors";
import {
    Log,
    LogWriter,
    LogLevel,
    LogLevels,
    LogMethod,
    LogNamespace,
    LogParameter
} from "./Log";
import {ScribeLog} from "./ScribeLog";
import {ConsoleWriter} from "./writers";


// constants
const ROOT_NAMESPACE = undefined;
const ROOT_LOGLEVEL_CONFIG: LogLevelConfig = {
    pattern: "*",
    matcher: /^.*$/,
    level: "error"
};
const NAMESPACE_MATCH = new RegExp(/^(\w+)((:\w+)(\/\w+)*)?$/);
const NAMESPACE_PATTERN_MATCH = new RegExp(/^[\w\/:*]+$/);


// types
export type LogNamespacePattern = string;
type LogLevelConfig = {
    pattern: LogNamespacePattern;
    matcher: RegExp;
    level: LogLevel;
};


// class definition
export class Scribe {

    public static writer: LogWriter = ConsoleWriter;

    private static _log: ScribeLog = Scribe.createRootLog();
    private static readonly _logs = new Map<LogNamespace, ScribeLog>([[ROOT_NAMESPACE, Scribe._log]]);
    private static readonly _levelConfigs: Array<LogLevelConfig> = [ROOT_LOGLEVEL_CONFIG];


    public static get log() { return Scribe._log; }


    public static reset() {

        // reset internals
        Scribe.writer = ConsoleWriter;
        Scribe._log = Scribe.createRootLog();
        Scribe._logs.clear();
        Scribe._logs.set(ROOT_NAMESPACE, Scribe._log);
        Scribe._levelConfigs.splice(0, Scribe._levelConfigs.length, ROOT_LOGLEVEL_CONFIG);
    }

    public static getLog(namespace: LogNamespace): Log {

        // throw if there's no namespace provided (blank)
        if (!namespace) {
            throw new ArgumentError("namespace",
                "A namespace must be provided when acquiring logs.");
        }

        // or throw if the format is incorect
        else if (!namespace.match(NAMESPACE_MATCH)) {
            throw new ArgumentError("namespacePattern",
                "Invalid namespace (see ...).");
        }

        // use cached log, or create one
        let log = Scribe._logs.get(namespace);
        if (!log) {

            // create new log with level set based on rules
            log = new ScribeLog(namespace, Scribe.getLogLevel(namespace), Scribe.logProxy);

            // map the log
            Scribe._logs.set(namespace, log);
        }

        // return log
        return log;
    }

    public static setLogLevel(namespacePattern: LogNamespacePattern,  level: LogLevel) {

        // throw if pattern is invalid
        const matches = [...namespacePattern.matchAll(NAMESPACE_PATTERN_MATCH)];
        if (!matches || matches.length === 0) {

            // TODO: update message to reference documenation link
            throw new ArgumentError("namespacePattern",
                "Invalid namespace pattern (see ...).");
        }

        // remove exact pattern match
        const prevConfigIndex = Scribe._levelConfigs.findIndex(config => config.pattern === namespacePattern);
        if (prevConfigIndex >= 0) {
            Scribe._levelConfigs.splice(prevConfigIndex, 1);
        }

        // create regexp for pattern
        const regexpPattern = namespacePattern
            .replace(/\//g, "\\/")
            .replace(/\*/g, ".*");
        const matcher = new RegExp(`^${regexpPattern}$`);

        // add new config to start
        Scribe._levelConfigs.splice(0, 0, {
            pattern: namespacePattern,
            matcher: matcher,
            level: level
        });

        // update all the existing log levels
        for (const log of Scribe._logs.values()) {
            log.level = Scribe.getLogLevel(log.namespace);
        }
    }

    private static getLogLevel(namespace: LogNamespace): LogLevel {

        // scan loglevel configurations for first match
        const config = Scribe._levelConfigs.find(config => config.matcher.test(namespace || ""));

        // throw if there's no matching level (root should always be the fallback)
        if (!config) {
            throw new IllegalStateError("Unable to find matching level for namespace: " + namespace);
        }

        // return level
        return config.level;
    }

    private static createRootLog() {
        return new ScribeLog(ROOT_NAMESPACE, ROOT_LOGLEVEL_CONFIG.level, Scribe.logProxy);
    }

    private static logProxy(log: Log, method: LogMethod, message: LogParameter,
                            ...args: ReadonlyArray<LogParameter>) {

        // only log if level is high enough for method
        const level = log.level;
        if (LogLevels.indexOf(level) <= LogLevels.indexOf(method)) {
            Scribe.writer(log, method, message, ...args);
        }
    }
}
