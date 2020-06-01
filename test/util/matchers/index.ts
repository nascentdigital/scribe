// imports
import {Log, LogContext, LogMethod, LogParameter} from "../../../src";
import "./toBeContext";


// jest extension
declare global {
    namespace jest {
        interface Matchers<R> {
            toBeContext(context: LogContext): R;

            toBeContext(log: Log, method: LogMethod, message: LogParameter,
                        ...args: ReadonlyArray<LogParameter>): R;
        }
    }
}
