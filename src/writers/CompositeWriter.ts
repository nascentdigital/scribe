// imports
import {LogContext, LogWriter} from "../Log";


// writer
export function CompositeWriter(...writers: ReadonlyArray<LogWriter>): LogWriter {

    // compose writers
    return function(context: LogContext) {

        // broadcast message to writers
        for (const writer of writers) {
            writer(context);
        }
    }
}
