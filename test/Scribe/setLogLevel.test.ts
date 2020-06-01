// imports
import "jest";
import {ArgumentError} from "@nascentdigital/errors";
import {
    Log,
    LogLevel,
    LogLevels,
    LogNamespace,
    LogNamespacePattern,
    Scribe,
    NullWriter
} from "../../src";
import {LogMethods} from "../util";


// constants
const mockLogWriter = jest.fn(NullWriter);


// types
type TestParameters = {
    pattern: LogNamespacePattern,
    level: LogLevel,
    namespaces: ReadonlyArray<LogNamespace>
};
type RootTestParameters = Omit<TestParameters, "pattern">;
type FlowOrder = "normal" | "reverse" | "mixed";


// lifecycle
beforeEach(() => {

    // reset framework before each test
    Scribe.reset();

    // bind mock log output
    Scribe.writer = mockLogWriter;
});


// test suite
describe("Scribe.setLogLevel()", () => {

    describe("should throw if namespace pattern", () => {

        test("is empty", () => {
            expect(() => Scribe.setLogLevel("", "debug"))
                .toThrow(ArgumentError);
        });

        test("has invalid characters", () => {
            expect(() => Scribe.setLogLevel("test$", "debug"))
                .toThrow(ArgumentError);
            expect(() => Scribe.setLogLevel("test-name", "debug"))
                .toThrow(ArgumentError);
            expect(() => Scribe.setLogLevel("test.name", "debug"))
                .toThrow(ArgumentError);
        });
    });

    describe("should be able to target", () => {

        test("everything", () => testRootChange({
                level: "debug",
                namespaces: [
                    "moduleA:feature1",
                    "moduleA:feature2",
                    "moduleA:feature3/method1",
                    "moduleA:feature3/method2"
                ]
            })
        );

        test("all features in a module", () => testChange(
            {
                pattern: "moduleA:*",
                level: "debug",
                namespaces: [
                    "moduleA:feature1",
                    "moduleA:feature2",
                    "moduleA:feature3/method1",
                    "moduleA:feature3/method2"
                ]
            },
            {
                pattern: "moduleB:*",
                level: "warn",
                namespaces: [
                    "moduleB:feature1",
                    "moduleB:feature2",
                    "moduleB:feature3/method1"
                ]
            },
            [
                "moduleA1",
                "_moduleA",
                "moduleC",
                "moduleC:feature1",
                "moduleBB"
            ])
        );

        test("all methods in a feature", () => testChange(
            {
                pattern: "moduleA:featureA/*",
                level: "warn",
                namespaces: [
                    "moduleA:featureA/method1",
                    "moduleA:featureA/method2",
                    "moduleA:featureA/method2/variant"
                ]
            },
            {
                pattern: "moduleA:featureB/*",
                level: "trace",
                namespaces: [
                    "moduleA:featureB/method1"
                ]
            },
            [
                "moduleA",
                "moduleA:featureA",
                "moduleA:featureB",
                "moduleB",
                "moduleB:featureA/method1",
                "moduleB:featureA/method1"
            ],
            "reverse")
        );

        test("targets all modules + features with a method", () => testChange(
            {
                pattern: "*:*/methodA",
                level: "trace",
                namespaces: [
                    "moduleA:featureA/methodA",
                    "moduleA:featureB/methodA",
                    "moduleB:featureA/methodA",
                    "moduleC:featureA/methodB/methodA"
                ]
            },
            {
                pattern: "*/methodB",
                level: "debug",
                namespaces: [
                    "moduleA:featureA/methodB",
                    "moduleA:featureB/methodB",
                    "moduleB:featureA/methodB",
                    "moduleA:featureA/methodA/methodB"
                ]
            },
            [
                "moduleA",
                "moduleA:featureA",
                "moduleA:featureA/methodC",
                "moduleB",
                "moduleA:featureA/methodA/variant",
                "moduleA:featureA/methodB/variant",
            ],
            "mixed")
        );
    });

    describe("should target best match based on", () => {

        test("specificity (infix)", () => testChange(
            {
                pattern: "moduleA:*",
                level: "trace",
                namespaces: [
                    "moduleA:featureA",
                    "moduleA:featureA",
                    "moduleA:featureB/methodA/variant",
                    "moduleA:featureB/methodB",
                    "moduleA:featureB/methodC"
                ]
            },
            {
                pattern: "moduleA:*/methodA",
                level: "warn",
                namespaces: [
                    "moduleA:featureA/methodA",
                    "moduleA:featureB/methodA",
                    "moduleA:featureB/methodB/methodA"
                ]
            },
            [
                "moduleB",
                "moduleB:featureA/methodA"
            ],
            "normal")
        );

        test("specificity (postfix)", () => testChange(
            {
                pattern: "moduleA:*",
                level: "trace",
                namespaces: [
                    "moduleA:featureA",
                    "moduleA:featureA",
                    "moduleA:featureB/methodB",
                    "moduleA:featureB/methodB/variant",
                    "moduleA:featureB/methodC"
                ]
            },
            {
                pattern: "moduleA:featureB/methodA*",
                level: "warn",
                namespaces: [
                    "moduleA:featureB/methodA",
                    "moduleA:featureB/methodA/variant",
                    "moduleA:featureB/methodA/methodA"
                ]
            },
            [
                "moduleB",
                "moduleB:featureA/methodA"
            ],
            "normal")
        );

        test("order", () => testChange(
            {
                pattern: "moduleA:*",
                level: "trace",
                namespaces: [
                    "moduleA:featureA",
                    "moduleA:featureA",
                    "moduleA:featureA/methodA",
                    "moduleA:featureB/methodA",
                    "moduleA:featureB/methodB/methodA",
                    "moduleA:featureB/methodA/variant",
                    "moduleA:featureB/methodB",
                    "moduleA:featureB/methodC"
                ]
            },
            {
                pattern: "moduleA:*/methodA",
                level: "warn",
                namespaces: []
            },
            [
                "moduleB",
                "moduleB:featureA/methodA"
            ],
            "reverse")
        );
    });

    test("should be able to override an existing pattern", () => {

        // run initial tests
        testChange(
            {
                pattern: "moduleA:*",
                level: "trace",
                namespaces: [
                    "moduleA:featureA",
                    "moduleA:featureB",
                    "moduleA:featureA/methodA",
                    "moduleA:featureA/methodB",
                    "moduleA:featureA/methodB/variant",
                ]
            },
            {
                pattern: "moduleB:*",
                level: "debug",
                namespaces: [
                    "moduleB:featureA",
                    "moduleB:featureB",
                    "moduleB:featureA/methodA",
                    "moduleB:featureA/methodB",
                    "moduleB:featureA/methodB/variant",
                ]
            },
            [
                "moduleC",
                "moduleD:featureA",
                "moduleD:featureA/methodC"
            ]
        );

        // run aggregate tests (notice control has more specific targeting on primary module)
        testChange(
            {
                pattern: "moduleA:*",
                level: "warn",
                namespaces: [
                    "moduleA:featureA",
                    "moduleA:featureB",
                    "moduleA:featureA/methodB",
                    "moduleA:featureA/methodB/variant"
                ]
            },
            {
                pattern: "moduleA:*/methodA*",
                level: "silent",
                namespaces: [
                    "moduleA:featureA/methodA",
                    "moduleA:featureA/methodA/variant",
                    "moduleA:featureB/methodA",
                    "moduleA:featureC/methodA/variant"
                ]
            },
            [
                "moduleC",
                "moduleD:featureA",
                "moduleD:featureA/methodC"
            ]
        );
    });
});


// helpers

function testChange(target: TestParameters, control: TestParameters, defaultNamespaces: ReadonlyArray<LogNamespace>,
                    order: FlowOrder = "normal") {

    // test data
    const defaultLevel: LogLevel = Scribe.log.level;

    // sanity test data
    expect(defaultLevel).not.toEqual(target.level);
    expect(target.level).not.toEqual(control.level);

    // validate binding calls succeed
    if (order === "normal") {
        expect(() => Scribe.setLogLevel(target.pattern, target.level)).not.toThrow();
        expect(() => Scribe.setLogLevel(control.pattern, control.level)).not.toThrow();
    }
    else {
        expect(() => Scribe.setLogLevel(control.pattern, control.level)).not.toThrow();
        expect(() => Scribe.setLogLevel(target.pattern, target.level)).not.toThrow();
    }

    // validate root is not affected
    testOutput(Scribe.log, defaultLevel)

    // create new logs
    let targetLogs: Log[];
    let controlLogs: Log[];
    let defaultLogs: Log[];
    if (order === "normal") {
        targetLogs = target.namespaces.map(namespace => Scribe.getLog(namespace));
        controlLogs = control.namespaces.map(namespace => Scribe.getLog(namespace));
        defaultLogs = defaultNamespaces.map(namespace => Scribe.getLog(namespace));
    }
    else if (order === "reverse") {
        defaultLogs = defaultNamespaces.map(namespace => Scribe.getLog(namespace));
        controlLogs = control.namespaces.map(namespace => Scribe.getLog(namespace));
        targetLogs = target.namespaces.map(namespace => Scribe.getLog(namespace));
    }
    else {
        controlLogs = control.namespaces.map(namespace => Scribe.getLog(namespace));
        defaultLogs = defaultNamespaces.map(namespace => Scribe.getLog(namespace));
        targetLogs = target.namespaces.map(namespace => Scribe.getLog(namespace));
    }

    // verify logs have correct levels
    targetLogs.forEach(log => testOutput(log, target.level));
    controlLogs.forEach(log => testOutput(log, control.level));
    defaultLogs.forEach(log => testOutput(log, defaultLevel));
}

function testRootChange({level, namespaces}: RootTestParameters) {

    // test data
    const defaultLevel: LogLevel = Scribe.log.level;
    const rootPattern: LogNamespacePattern = "*";

    // sanity test data
    expect(defaultLevel).not.toEqual(level);

    // validate binding call succeeds
    expect(() => Scribe.setLogLevel(rootPattern, level)).not.toThrow();

    // validate root is affected
    testOutput(Scribe.log, level)

    // create new logs
    const logsA = namespaces.map(namespace => Scribe.getLog(namespace));

    // validate binding to new level
    logsA.forEach(log => testOutput(log, level));
}

function testOutput(log: Log, level: LogLevel) {

    // verify level
    expect(log.level).toEqual(level);

    // log at all levels
    LogMethods.forEach((method) => {

        // reset mock
        mockLogWriter.mockClear();
        const mock = mockLogWriter.mock;
        expect(mock.calls.length).toBe(0);

        // log a message
        log[method]("a message");

        // determine expected call count
        const expectedCalls = LogLevels.indexOf(method) >= LogLevels.indexOf(level) ? 1 : 0;
        expect(mock.calls.length).toBe(expectedCalls);
    });
}
