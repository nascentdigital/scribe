import chalk from 'chalk'
import { LogContext, LogMethod, LogParameter, LogColoringOption } from "../Log";

function applyColorBasedOnLogMethod(message: LogParameter, method: LogMethod): LogParameter {

    /**
     * TODO: add a check here to see if coloring is possible (if not, then no-op)
     */

    switch (method) {
        case "trace":
            return chalk.white(message)
        case "debug":
            return chalk.blue(message)
        case "info":
            return chalk.yellow(message)
        case "warn":
            return chalk.rgb(255, 165, 0)(message)
        case "error":
            return chalk.red(message)
        default:
            message
    }
}

export function ColorTransform(logColoringOption: LogColoringOption) {

    // create transform
    return function (context: LogContext) {

        const { message, method, ...contextData } = context;

        let coloredMessage = message

        switch (logColoringOption) {
            case "none":
                break;
            case "level":
                coloredMessage = applyColorBasedOnLogMethod(message, method);
                break;
            case "namespace":
                break;
            default:
                break;
        }
    
        return { ...contextData, message: coloredMessage, method }
    }
}
