module.exports = {
  testMatch: ['**/tests/unit/**/*.test.js'],
  testEnvironment: 'node',
  collectCoverageFrom: ['index.html'],
  coverageDirectory: 'coverage',
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: 'test-results', outputName: 'junit-unit.xml' }]
  ]
};
