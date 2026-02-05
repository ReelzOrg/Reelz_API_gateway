export default {
	testEnvironment: 'node',
	extensionsToTreatAsEsm: [".ts"],
	transform: {
		// Use SWC for fast, production-ready transpilation
		'^.+\\.(t|j)sx?$': [
			'@swc/jest',
			{
				jsc: {
					target: 'es2022', // Matches Node 22 capabilities
					parser: {
						syntax: 'typescript',
					},
				},
			},
		],
	},
	transformIgnorePatterns: ['<rootDir>/node_modules/'],
	// extensionsToTreatAsEsm: ['.js'],
	moduleNameMapper: {
		// Handle ESM imports with extensions (e.g., import x from './file.js')
		// '^(\\.{1,2}/.*)\\.js$': '$1',

		// It maps `import './file.js'` to the actual `./file.ts` or `./file.js` on disk.
		'^(\\.\\.?\\/.+)\\.js$': '$1',
	},
	testMatch: ['**/tests/**/*.test.js'],
	setupFilesAfterEnv: ['<rootDir>/tests/setupTests.js'],
	collectCoverage: true,
	coverageDirectory: 'coverage',
	collectCoverageFrom: [
		'**/*.js',
		'!**/node_modules/**',
		'!**/tests/**',
		'!**/coverage/**',
		'!jest.config.js',
	],
	testPathIgnorePatterns: ['/node_modules/'],
	verbose: true,
};
