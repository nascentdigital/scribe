module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    collectCoverage: true,
    collectCoverageFrom: [
        "src/**/*.ts"
    ],
    coverageDirectory: "./coverage/",
    coverageReporters: [
        "lcov"
    ],
    globals: {
        "ts-jest": {
            tsConfig: "./tsconfig.test.json"
        }
    }
};
