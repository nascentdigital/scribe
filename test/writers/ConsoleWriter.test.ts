// imports
import "jest";
import {
    ConsoleWriter, LogContext, LogMethod, LogParameter,
    Scribe
} from "../../src";
import SpyInstance = jest.SpyInstance;


// lifecycle
beforeEach(() => {

    // reset framework before each test
    Scribe.reset();

    // adjust level to trace by default
    Scribe.setLogLevel("*", "trace");
});


// test suite
describe("ConsoleWriter", () => {

    test("should be enabled by default", () => {
        expect(Scribe.writer).toBe(ConsoleWriter);
    });

    test("should output to console.debug for trace messages",
        () => testOutput("trace", "trace message", ["abc", 123]));

    test("should output to console.debug for debug messages",
        () => testOutput("debug", "debug message", ["params"]));

    test("should output to console.log for info messages",
        () => testOutput("info", "info message", [1, undefined]));

    test("should output to console.warn for warn messages",
        () => testOutput("warn", "warning message", [true, "abc", 123]));

    test("should output to console.error for error messages",
        () => testOutput("error", "error message", [new Error("Oops!")]));
});


// helpers
function testOutput(method: LogMethod, message: LogParameter,
                    args: ReadonlyArray<LogParameter>) {

    // hijack console
    let consoleMock;
    switch (method) {
        case "trace":
        case "debug":
            consoleMock = jest.spyOn(console, "debug");
            break;
        case "info":
            consoleMock = jest.spyOn(console, "log");
            break;
        case "warn":
            consoleMock = jest.spyOn(console, "warn");
            break;
        case "error":
            consoleMock = jest.spyOn(console, "error");
            break;
    }
    consoleMock.mockImplementation(() => {});

    // log
    Scribe.log[method](message, ...args);

    // validate
    const mock = consoleMock.mock;
    expect(mock.calls).toHaveLength(1);
    const invocation = mock.calls[0];
    expect(invocation).toHaveLength(1 + args.length);
    expect(invocation[0]).toBe(message);
    const invocationArgs = invocation.splice(1);
    expect(invocationArgs).toEqual(args);

    // restore console
    consoleMock.mockRestore();
}
