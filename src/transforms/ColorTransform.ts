import chalk from 'chalk'
import { LogContext, LogMethod, LogParameter, LogColoringOption, LogNamespace, LogColorRGB } from "../Log";
import { Scribe } from '../Scribe';

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

function applyColorBasedOnLogNamespace(message: LogParameter, namespace: LogNamespace): LogParameter {
    let logColorRGB: LogColorRGB = [0, 0, 0]

    if (Scribe.logColors.has(namespace)) {
        logColorRGB = Scribe.logColors.get(namespace) as LogColorRGB
    }

    else {
        logColorRGB = [255*Math.random(), 255*Math.random(), 255*Math.random()]
        Scribe.logColors.set(namespace, logColorRGB)
    }

    return chalk.rgb(...logColorRGB)(message)
}

export function ColorTransform(logColoringOption: LogColoringOption) {

    // create transform
    return function (context: LogContext) {

        const { message, method, log: { namespace } } = context;

        let coloredMessage = message

        switch (logColoringOption) {
            case "none":
                break;
            case "level":
                coloredMessage = applyColorBasedOnLogMethod(message, method);
                break;
            case "namespace":
                coloredMessage = applyColorBasedOnLogNamespace(message, namespace)
                break;
            default:
                break;
        }
    
        return { ...context, message: coloredMessage, method }
    }
}
