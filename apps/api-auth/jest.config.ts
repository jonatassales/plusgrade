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
    '^@application/(.*)$': '<rootDir>/src/auth/application/$1',
    '^@common/(.*)$': '<rootDir>/src/common/$1',
    '^@domain/(.*)$': '<rootDir>/src/auth/domain/$1',
    '^@infra/(.*)$': '<rootDir>/src/auth/infra/$1',
    '^@interface/(.*)$': '<rootDir>/src/auth/interface/$1'
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/']
}

export default config
