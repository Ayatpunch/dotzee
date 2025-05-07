module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: [
        '@typescript-eslint',
        'prettier', // Optional: if you use eslint-plugin-prettier
    ],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier', // Ensures Prettier rules are applied last, overriding others
    ],
    env: {
        node: true,
        es2021: true,
    },
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.eslint.json', // Changed to use tsconfig.eslint.json
    },
    rules: {
        // Optional: if you use eslint-plugin-prettier
        'prettier/prettier': 'warn', // Or 'error' to fail on Prettier issues
        // Add any custom ESLint rules here
        'no-unused-vars': 'off', // Handled by @typescript-eslint/no-unused-vars
        '@typescript-eslint/no-unused-vars': [
            'warn',
            {
                argsIgnorePattern: '_',
                varsIgnorePattern: '_',
                caughtErrorsIgnorePattern: '_',
            },
        ],
    },
    ignorePatterns: [
        'dist/',
        'node_modules/',
        '*.config.js',
        '*.config.ts',
        '.eslintrc.js',
    ],
};
