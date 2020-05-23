// imports
import "jest";
import {ArgumentError} from "@nascentdigital/errors";
import {
    Scribe
} from "../src";


// test suite
describe("namespaces", () => {

    test("must be provided when obtaining a log", () => {
        expect(() => Scribe.getLog(""))
            .toThrow(ArgumentError);
    });
});
