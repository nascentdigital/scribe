// imports
import {LogWriter} from "./Log";
import {
    ConsoleWriter,
    NullWriter
} from "./writers";


// class definition
export class LogTransformBuilder {

    constructor() {
    }

    with(writer: LogWriter): LogTransformBuilder {

        // continue building
        return this;
    }

    withColors(): LogTransformBuilder {

        // continue building
        return this;
    }

    withPrefix(): LogTransformBuilder {

        // continue building
        return this;
    }
}
