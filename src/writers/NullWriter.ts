// imports
import {Log, LogMethod, LogParameter} from "../Log";


// log function
export function NullWriter(_log: Log, _method: LogMethod, _message: LogParameter,
                           ..._args: ReadonlyArray<LogParameter>): void {
}
