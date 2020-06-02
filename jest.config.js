module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    collectCoverageFrom: [
        "src/*.ts"
    ],
    globals: {
        "ts-jest": {
            tsConfig: "./tsconfig.test.json"
        }
    }
};
