// imports
import {mocked} from "ts-jest/utils";
import {Log, LogMethod, LogParameter, Scribe} from "../../src";
import {ScribeLog} from "../../src/ScribeLog";


// implementation
export function expectOutputToBeUnchanged(log: Log, method: LogMethod, message: LogParameter,
                                          ...args: ReadonlyArray<LogParameter>) {

    // sanity tests
    const mockWriter = mocked(Scribe.writer);
    const mock = mockWriter.mock;
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
    expect(invocation).toHaveLength(1);
    const context = invocation[0];
    expect(context.log).toBeInstanceOf(ScribeLog);
    expect(context.method).toEqual(method);

    // validate message
    expect(typeof context.message).toBe(typeof message);
    expect(context.message).toEqual(message);

    // validate arguments (if any)
    if (hasArgs && args) {

        // check args array
        expect(typeof context.args).toBe(typeof args);
        expect(context.args).toHaveLength(args.length);

        // check individual parameters
        args.forEach((arg, index) => {

            // verify types are same
            const contextArg = context.args[index];
            expect(typeof contextArg).toBe(typeof arg);
            expect(contextArg).toBe(arg);
        })
    }
}
