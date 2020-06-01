// imports
import "jest";
import {equals} from "expect/build/jasmineUtils";
import {matcherHint, printExpected, printReceived} from "jest-matcher-utils";
import {Log, LogContext, LogMethod, LogParameter} from "../../../src";


// type checkers
function isLogContext(object: any): object is LogContext {
    return object.hasOwnProperty("log")
        && object.hasOwnProperty("method")
        && object.hasOwnProperty("message")
        && object.hasOwnProperty("args");
}


// constants
const MatcherName = ".toBeContext";


// implementation
expect.extend({
    toBeContext(received: any, logOrContext: Log | LogContext, method?: LogMethod,
                message?: LogParameter, ...args: ReadonlyArray<LogParameter>) {

        // validate underlying type
        if (!isLogContext(received)) {
            return {
                pass: false,
                message: () => matcherHint(MatcherName, "received") + "\n\n" +
                    "Expected value to be a LogContext, but received: \n   " +
                    printReceived(received)
            };
        }

        // normalize parameters
        const context: Partial<LogContext> = isLogContext(logOrContext)
            ? logOrContext
            : {log: logOrContext, method, message, args};

        // handle miss-match
        if (context.method !== received.method
            || context.message !== received.message
            || !context.args
            || context.args.length !== received.args.length
            || !context.args.every((arg, index) =>
                equals(received.args[index], arg))) {
            return {
                pass: false,
                message: () => matcherHint(MatcherName) + "\n\n" +
                    "Expected LogContext match: \n   " +
                    printExpected(context) + "\nReceived:\n  " +
                    printReceived(received)
            };
        }

        // otherwise pass
        else {
            return {
                pass: true,
                message: () => matcherHint(".not" + MatcherName) + "\n\n" +
                    "Expected LogContext not to match: \n   " +
                    printExpected(context) + "\nReceived:\n  " +
                    printReceived(received)
            };
        }
    }
});

