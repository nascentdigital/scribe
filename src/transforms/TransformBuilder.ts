// imports
import {LogWriter} from "../Log";


// class definition
export class TransformBuilder {

    constructor() {
    }

    with(writer: LogWriter): TransformBuilder {

        // continue building
        return this;
    }

    withColors(): TransformBuilder {

        // continue building
        return this;
    }

    withPrefix(): TransformBuilder {

        // continue building
        return this;
    }
}
