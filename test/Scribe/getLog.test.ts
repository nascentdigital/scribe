// imports
import "jest";
import {ArgumentError} from "@nascentdigital/errors";
import {
    LogLevel,
    Scribe
} from "../../src";
import {
    ScribeLog
} from "../../src/ScribeLog";


// constants
const LOG_NAMESPACE_A = "module:featureA";
const LOG_NAMESPACE_B = "module:featureB";


// lifecycle
beforeEach(() => {

    // reset framework before each test
    Scribe.reset();
});


// test suite
describe("Scribe.getLog()", () => {

    describe("should throw if namespace", () => {

        test("is empty", () => {
            expect(() => Scribe.getLog(""))
                .toThrow(ArgumentError);
        });

        test("has invalid characters", () => {
            expect(() => Scribe.getLog("test$"))
                .toThrow(ArgumentError);
            expect(() => Scribe.getLog("test+name"))
                .toThrow(ArgumentError);
            expect(() => Scribe.getLog("test.name"))
                .toThrow(ArgumentError);
        });

        test("has a trailing colon", () => {
            expect(() => Scribe.getLog("test:"))
                .toThrow(ArgumentError);
        });

        test("has a double colon", () => {
            expect(() => Scribe.getLog("test::feature"))
                .toThrow(ArgumentError);
        });

        test("has a trailing slash", () => {
            expect(() => Scribe.getLog("test:feature/"))
                .toThrow(ArgumentError);
        });

        test("has a double slash", () => {
            expect(() => Scribe.getLog("test:feature//method"))
                .toThrow(ArgumentError);
        });
    });

    describe("should succeed if namespace", () => {

        test("is just a module", () => {
            expect(Scribe.getLog("module")).toBeInstanceOf(ScribeLog);
        });

        test("has a feature", () => {
            expect(Scribe.getLog("module:feature")).toBeInstanceOf(ScribeLog);
        });

        test("has a method", () => {
            expect(Scribe.getLog("module:feature/method")).toBeInstanceOf(ScribeLog);
        });

        test("has a method variant", () => {
            expect(Scribe.getLog("module:feature/method/variant")).toBeInstanceOf(ScribeLog);
        });

        test("uses extended characters", () => {
            expect(Scribe.getLog("module_name:feature_name/method1")).toBeInstanceOf(ScribeLog);
            expect(Scribe.getLog("module_name-1:feature_name-1/method_name-1")).toBeInstanceOf(ScribeLog);
        });
    });

    test("should create log with a matching namespace", () => {

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

    describe("should be initialized with log level that", () => {

        test("matches default root level", () => {

            // get log
            const logA = Scribe.getLog(LOG_NAMESPACE_A);

            // validate log level matches root
            expect(logA.level).toEqual(Scribe.log.level);
        });

        test("matches updated root level", () => {

            // test data
            const updatedLevel: LogLevel = "debug";

            // validate updated level isn't default (sanity test)
            expect(Scribe.log.level).not.toEqual(updatedLevel);

            // update root level
            Scribe.setLogLevel("*", updatedLevel);

            // get log
            const logA = Scribe.getLog(LOG_NAMESPACE_A);

            // validate log level matches root
            expect(logA.level).toEqual(updatedLevel);
        });
    });
});
