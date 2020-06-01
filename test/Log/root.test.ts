// imports
import "jest";
import {
    Scribe,
} from "../../src";
import {LogTester} from "../util";


// constants
const logTester = new LogTester();


// lifecycle
beforeEach(() => {

    // reset framework before each test
    Scribe.reset();

    // bind output to scribe
    logTester.initialize();
});


// test suite
describe("root Log", () => {

    logTester.testSingleMessage(() => Scribe.log);
    logTester.testSingleArg(() => Scribe.log);
    logTester.testMultiArg(() => Scribe.log);
});
