// imports
import {LogContext} from "../Log";


/**
 * Creates a new transform that adds a prefix to outputted log messages.
 *
 * The `PrefixTransform` supports the following variables as a part of the format string:
 *
 * Format Specifier | Output
 * --------------------------------------------
 *  %m              | The logging method being invoked (e.g. "debug", "info", "error")
 *  %M              | The logging method in uppercase (e.g. "TRACE", "WARN")
 *  %n              | The namespace of the logger (e.g. "scribe:Scribe/getLog")
 *
 *  Examples:
 *
 *  `"[%M : %n] "` => `[DEBUG: module:feature] a logging message`
 *
 * @param format The format string to be prefixed before all logging outputs.
 * @constructor
 */
export function PrefixTransform(format: string) {

    // create transform
    return function (context: LogContext) {

        // extract values
        const {message, ...contextData} = context;

        // determine prefix
        const prefix = format.replace(/((%%)|(%m)|(%M)|(%n))/g,
            (match) => {
                switch (match) {
                    case "%%":
                        return "%";
                    case "%m":
                        return context.method;
                    case "%M":
                        return context.method.toUpperCase();
                    case "%n":
                        return context.log.namespace || "*";
                    default:
                        return match;
                }
            });

        // return updated context with prefixed message
        return {...contextData, message: prefix + message};
    }
}
