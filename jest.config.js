/*
  About transformIgnorePatterns see:
    - https://jestjs.io/docs/ecmascript-modules
    - https://stackoverflow.com/questions/63389757/jest-unit-test-syntaxerror-cannot-use-import-statement-outside-a-module
*/

module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  transform: {
    '^.+\\.vue$': 'vue-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(lodash-es)/)',
  ],
};
