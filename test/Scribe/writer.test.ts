// imports
import "jest";
import {
    ConsoleWriter,
    Scribe
} from "../../src";


// lifecycle
beforeEach(() => {

    // reset framework before each test
    Scribe.reset();
});


// test suite
describe("Scribe.writer", () => {

    test("should be set to ConsoleWriter by default", () => {
        expect(Scribe.writer).toBe(ConsoleWriter);
    });
});
