// imports
import {Log, LogMethod, LogParameter} from "../Log";


// writer
export function ConsoleWriter(log: Log, method: LogMethod, message: LogParameter,
                              ...args: ReadonlyArray<LogParameter>) {
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
