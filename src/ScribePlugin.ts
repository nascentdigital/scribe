// imports
import {LogFunction} from "./Log";


// types
export type ScribePlugin = (logFn: LogFunction) => LogFunction;
