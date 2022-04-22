/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  coverageDirectory: "coverage",
  testEnvironment: "jsdom",
  transform: {
    "\\.[jt]sx?$": "babel-jest",
  },
  setupFilesAfterEnv: ["<rootDir>/jest-setup.ts"]
};
