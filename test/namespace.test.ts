// imports
import "jest";
import {ArgumentError} from "@nascentdigital/errors";
import {
    Scribe
} from "../src";
import {
    ScribeLog
} from "../src/ScribeLog";


// constants
const LOG_NAMESPACE_A = "namespaceA";
const LOG_NAMESPACE_B = "namespaceB";


// test suite
describe("namespaces", () => {

    test("show if invalid namespace if provided", () => {

        expect(() => Scribe.getLog(""))
            .toThrow(ArgumentError);
    });

    test("should create log for valid namespace", () => {

        // get a log
        const logA = Scribe.getLog(LOG_NAMESPACE_A);

        // validate that it looks good
        expect(logA).toBeDefined();
        expect(logA).toBeInstanceOf(ScribeLog);
        expect(logA.namespace).toEqual(LOG_NAMESPACE_A);
    });

    test("should return the same log if the same namespace is used", () => {

        // get the same log twice
        const logA = Scribe.getLog(LOG_NAMESPACE_A);
        const logA2 = Scribe.getLog(LOG_NAMESPACE_A);

        // ensure it's the same instance (not a copy)
        expect(logA2).toBe(logA);
        expect(logA2.namespace).toEqual(LOG_NAMESPACE_A);
    });

    test("should return different logs for different namespaces", () => {

        // get two different logs
        const logA = Scribe.getLog(LOG_NAMESPACE_A);
        const logB = Scribe.getLog(LOG_NAMESPACE_B);

        // validate the second log
        expect(LOG_NAMESPACE_A).not.toEqual(LOG_NAMESPACE_B);
        expect(logB.namespace).toEqual(LOG_NAMESPACE_B);

        // validate they are different
        expect(logB).not.toBe(logA);
    });

    test("should not affect previous logs when new namespaces are created", () => {

        // get two different logs
        const logA = Scribe.getLog(LOG_NAMESPACE_A);
        const logB = Scribe.getLog(LOG_NAMESPACE_B);

        // validate the second log
        expect(logB).not.toBe(logA);
        expect(logB.namespace).toEqual(LOG_NAMESPACE_B);

        // re-fetch and validate that log A is still good
        expect(Scribe.getLog(LOG_NAMESPACE_A)).toBe(logA);
        expect(logA).toBeInstanceOf(ScribeLog);
        expect(logA.namespace).toEqual(LOG_NAMESPACE_A);
    });
});
