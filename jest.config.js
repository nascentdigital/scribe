module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    collectCoverageFrom: [
        "src/*.ts",
        "src/writers/{!(ConsoleWriter),}.ts"
    ]
};
