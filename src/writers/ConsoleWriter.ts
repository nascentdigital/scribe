// imports
import {LogContext} from "../Log";


// writer
export function ConsoleWriter(context: LogContext) {

    // expand context
    const {method, message, args} = context;

    // process based on method
    switch (method) {
        case "trace":
        case "debug":
            console.debug(message, ...args);
            break;

        case "warn":
            console.warn(message, ...args);
            break;

        case "error":
            console.error(message, ...args);
            break;

        default:
            console.log(message, ...args);
    }
}
