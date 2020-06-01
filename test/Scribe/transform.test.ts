// imports
import "jest";
import {
    Scribe,
    NullWriter, IdentityTransform, LogMethod, LogContext, Log, LogParameter, LogTransform
} from "../../src";
import {expectOutputToBeUnchanged} from "../util";



// constants
const mockWriter = jest.fn(NullWriter);


// lifecycle
beforeEach(() => {

    // reset framework before each test
    Scribe.reset();

    // bind mock log output
    mockWriter.mockClear();
    Scribe.writer = mockWriter;
});


// test suite
describe("Scribe.transform", () => {

    test("should be undefined by default", () => {

        // validate
        expect(Scribe.transform).toBeUndefined();
    });

    test("should not affect output if unset", () => {

        // validate
        expectOutputToBeUnchanged(Scribe.log, "error", "message", 12);
    });

    test("should pass unfiltered calls to transform", () => {

        // assign transform
        const mockTransform = jest.fn(IdentityTransform);
        Scribe.transform = mockTransform;

        // validate
        const method: LogMethod = "error";
        const message = "message";
        const args = [12];
        expectOutputToBeUnchanged(Scribe.log, method, message, ...args);

        // validate transform was invoked
        const mock = mockTransform.mock;
        expect(mock.calls).toHaveLength(1);

        // validate transform args
        const invocation = mock.calls[0];
        expect(invocation).toHaveLength(1);
        const context = invocation[0];
        expect(context).toBeContext(Scribe.log, method, message, ...args);
    });

    test("should not pass filtered calls to transform", () => {

        // assign transform
        const mockTransform = jest.fn(IdentityTransform);
        Scribe.transform = mockTransform;

        // validate
        Scribe.log.debug("message");

        // validate transform was not invoked
        const mock = mockTransform.mock;
        expect(mock.calls).toHaveLength(0);
    });

    test("should forward transformed args to writer", () => {

        // test data
        const MessagePrefix = "prefix";
        const ExtraArg = "extra";

        // assign transform
        const transform: LogTransform = context => {
            return {
                log: context.log,
                method: context.method,
                message: MessagePrefix + context.message,
                args: [...context.args, ExtraArg]
            };
        };
        const mockTransform = jest.fn(transform);
        Scribe.transform = mockTransform;

        // validate
        const message = "message";
        const args = ["a", 1];
        Scribe.setLogLevel("*", "debug");
        Scribe.log.debug(message, ...args);

        // validate transform invocation
        expect(mockTransform.mock.calls).toHaveLength(1);
        const transformCall = mockTransform.mock.calls[0];
        expect(transformCall).toHaveLength(1);
        expect(transformCall[0]).toBeContext(Scribe.log, "debug", message, ...args);

        // validate writer invocation
        expect(mockWriter.mock.calls).toHaveLength(1);
        const writerCall = mockWriter.mock.calls[0];
        expect(writerCall).toHaveLength(1);
        expect(writerCall[0]).toBeContext(Scribe.log, "debug", MessagePrefix + message, ...[...args, ExtraArg]);
    });
});
