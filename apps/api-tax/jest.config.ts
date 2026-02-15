import type { Config } from 'jest'

const config: Config = {
  rootDir: '.',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.spec.json'
      }
    ]
  },
  moduleNameMapper: {
    '^@application/(.*)$': '<rootDir>/src/tax/application/$1',
    '^@domain/(.*)$': '<rootDir>/src/tax/domain/$1',
    '^@infra/(.*)$': '<rootDir>/src/tax/infra/$1',
    '^@interface/(.*)$': '<rootDir>/src/tax/interface/$1'
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/']
}

export default config
