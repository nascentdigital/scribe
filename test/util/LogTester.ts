// imports
import "jest";
import {
    Log,
    LogMethod,
    LogParameter,
    Scribe,
    NullWriter
} from "../../src";
import {ScribeLog} from "../../src/ScribeLog";
import {LogMethods} from "./constants";


// types
export type LogGetter = () => Log;
export type LogTestParams = {
    logGetter: LogGetter;
    method: LogMethod;
    message: LogParameter;
    args?: ReadonlyArray<LogParameter>;
};


// class definition
export class LogTester {

    private readonly mockLogWriter = jest.fn(NullWriter);

    public initialize() {
        this.mockLogWriter.mockClear();
        Scribe.writer = this.mockLogWriter;
    }

    public testSingleMessage(logGetter: LogGetter) {

        this.testLogMethods("should output simple message string for", {
            logGetter,
            message: "simple string"
        });

        this.testLogMethods("should output simple message number for", {
            logGetter,
            message: 10
        });

        this.testLogMethods("should output simple message boolean for", {
            logGetter,
            message: true
        });

        this.testLogMethods("should output simple message object for", {
            logGetter,
            message: {test: true, value: 32, message: "a message"}
        });

        this.testLogMethods("should output simple message array for", {
            logGetter,
            message: [true, "value", 13]
        });

        this.testLogMethods("should output simple message that is undefined for", {
            logGetter,
            message: undefined
        });

        this.testLogMethods("should output simple message Error for", {
            logGetter,
            message: new Error("Oops!")
        });
    }

    public testSingleArg(logGetter: LogGetter) {

        this.testLogMethods("should output additional string argument for", {
            logGetter,
            message: "base message",
            args: ["additional"]
        });

        this.testLogMethods("should output additional number argument for", {
            logGetter,
            message: "base message",
            args: [112]
        });

        this.testLogMethods("should output additional boolean argument for", {
            logGetter,
            message: "base message",
            args: [false]
        });

        this.testLogMethods("should output additional object argument for", {
            logGetter,
            message: "base message",
            args: [{number: 1, bool: true, message: "message"}]
        });

        this.testLogMethods("should output additional array argument for", {
            logGetter,
            message: "base message",
            args: [["a", 1, true]]
        });

        this.testLogMethods("should output additional undefined argument for", {
            logGetter,
            message: "base message",
            args: [undefined]
        });

        this.testLogMethods("should output additional Error argument for", {
            logGetter,
            message: "base message",
            args: [new Error("Oops!")]
        });
    }

    public testMultiArg(logGetter: LogGetter) {

        this.testLogMethods("should output multiple primitive arguments for", {
            logGetter,
            message: "base message",
            args: ["additional", true, 13]
        });

        this.testLogMethods("should output multiple object arguments for", {
            logGetter,
            message: "base message",
            args: [new Error("Oops!"), [], {a: 1, b: true}]
        });

        this.testLogMethods("should output multiple mixed arguments for", {
            logGetter,
            message: "base message",
            args: [undefined, new Error("Oops!"), false, "more", 13, new Map()]
        });
    }

    public testLogMethods(scenario: string, params: Omit<LogTestParams, "method">) {
        describe(scenario,
            () => LogMethods.forEach(method => this.testLogMethod(method, {method, ...params})));
    }

    public testLogMethod(name: string, params: LogTestParams) {

        test(name, () => {

            // extract params
            const {logGetter, message, method, args = []} = params;
            const log = logGetter();

            // ensure log is enabled for all levels
            if (log === Scribe.log) {
                Scribe.setLogLevel("*", method);
            }

            // cause the least side-effects as possible
            else if (log.namespace) {
                Scribe.setLogLevel(log.namespace, method);
            }

            // or fail (something went wrong!)
            else {
                fail("Unexpected log state.");
            }

            // sanity tests
            const mock = this.mockLogWriter.mock;
            expect(mock.calls.length).toBe(0);
            expect(log.level).toBe(method);

            // log message
            const hasArgs = args.length > 0;
            if (hasArgs) {
                log[method](message, ...args);
            }
            else {
                log[method](message);
            }

            // validate method was called only once
            expect(mock.calls.length).toBe(1);

            // validate invocation
            const invocation = mock.calls[0];
            expect(invocation).toHaveLength(3 + args.length);
            expect(invocation[0]).toBeInstanceOf(ScribeLog);
            expect(invocation[1]).toEqual(method);

            // validate message
            const messageParam = invocation[2];
            expect(typeof messageParam).toBe(typeof message);
            expect(messageParam).toEqual(message);

            // validate arguments (if any)
            if (hasArgs && args) {

                // check args array
                const argsParam = invocation.slice(3) as ReadonlyArray<LogParameter>;
                expect(typeof argsParam).toBe(typeof argsParam);
                expect(argsParam).toHaveLength(args.length);

                // check individual parameters
                args.forEach((arg, index) => {

                    // verify types are same
                    const param = argsParam[index];
                    const paramType = typeof param;
                    expect(paramType).toBe(typeof arg);
                    expect(param).toBe(arg);
                })
            }
        });
    }
}
