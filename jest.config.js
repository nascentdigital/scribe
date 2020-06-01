module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    collectCoverageFrom: [
        "src/*.ts",
        "src/writers/{!(ConsoleWriter),}.ts"
    ],
    globals: {
        "ts-jest": {
            tsConfig: "./tsconfig.test.json"
        }
    }
};
