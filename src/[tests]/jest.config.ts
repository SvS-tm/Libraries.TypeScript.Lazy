import { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
    preset: "ts-jest",
    rootDir: "..",
    moduleDirectories: [
        "node_modules",
        "src"
    ],
    testEnvironment: "node",
    passWithNoTests: true,
    verbose: true,
    testMatch: [
        "**/[tests]/**/*.ts?(x)",
        "!**/[tests]/jest.config.ts",
        "!**/[tests]/setup.ts"
    ],
    setupFiles: [
        "./[tests]/setup.ts"
    ]
};

export default config;
