// imports
import "jest";
import {
    Log,
    LogMethod,
    LogParameter,
    NullWriter,
    PrefixTransform,
    Scribe
} from "../../src";


// constants
const writerMock = jest.fn(NullWriter);


// lifecycle
beforeEach(() => {

    // reset framework before each test
    Scribe.reset();

    writerMock.mockClear();
    Scribe.writer = writerMock;

    // adjust level to trace by default
    Scribe.setLogLevel("*", "trace");
});


// test suite
describe("PrefixTransform", () => {

    test("should render method variable", () => testOutput("[trace] : ",
        Scribe.getLog("module:feature"), "[%m] : ",
        "trace", "a message", ["abc", 123]));

    test("should render uppercased method variable", () => testOutput("[DEBUG] : ",
        Scribe.getLog("module:feature"), "[%M] : ",
        "debug", "a message", ["abc", 123]));

    test("should render namespace variable", () => testOutput("[module:feature/method] ",
        Scribe.getLog("module:feature/method"), "[%n] ",
        "error", "a message", []));

    test("should render escaped %s", () => testOutput("log% ",
        Scribe.getLog("module:feature"), "log%% ",
        "warn", "a message", ["abc", 123]));

    test("should handle multiple parameters", () => testOutput("[WARN] module:feature - ",
        Scribe.getLog("module:feature"), "[%M] %n - ",
        "warn", "a message", ["abc", 123]));

    test("should handle mixed substitutions with escapes", () => testOutput("[%error] module:feature% %M- %",
        Scribe.getLog("module:feature"), "[%%%m] %n%% %%M- %%",
        "error", "a message", ["abc", 123]));
});


// helpers
function testOutput(prefix: string, log: Log, prefixFormat: string, method: LogMethod, message: LogParameter,
                    args: ReadonlyArray<LogParameter>) {

    // sanity test
    expect(writerMock).toHaveBeenCalledTimes(0);

    // set transform
    Scribe.transform = PrefixTransform(prefixFormat);

    // log
    log[method](message, ...args);

    // validate
    expect(writerMock).toHaveBeenCalledTimes(1);
    expect(writerMock).toHaveBeenCalledWith({
        log: log,
        method: method,
        message: prefix + message,
        args: args
    });
}
