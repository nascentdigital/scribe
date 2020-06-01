// imports
import "jest";
import {
    Scribe,
} from "../../src";
import {LogTester} from "../util";


// globals
const logTester = new LogTester();


// lifecycle
beforeEach(() => {

    // reset framework before each test
    Scribe.reset();

    // bind output to scribe
    logTester.initialize();
});


// test suite
describe("namespaced Log", () => {

    logTester.testSingleMessage(() => Scribe.getLog("module:feature"));
    logTester.testSingleArg(() => Scribe.getLog("module:feature"));
    logTester.testMultiArg(() => Scribe.getLog("module:feature"));
});
