// Legacy config for ESLint v7/v8 users (.eslintrc format)
// ESLint v9+ users should use eslint.config.js instead
module.exports = {
  plugins: ['performance-rules'],
  rules: {
    'performance-rules/no-quadratic-loops': 'warn',
    'performance-rules/no-sync-in-loop': 'warn',
    'performance-rules/no-large-json-parse-in-loop': 'warn',
    'performance-rules/react-no-inline-object-creation': 'warn',
    'performance-rules/no-unnecessary-array-clone': 'warn',
    'performance-rules/no-await-in-loop': 'warn',
    'performance-rules/no-regex-in-loop': 'warn',
    'performance-rules/no-dom-query-in-loop': 'warn',
    'performance-rules/prefer-map-over-reduce': 'warn',
    'performance-rules/no-object-spread-in-loop': 'warn',
    'performance-rules/no-console-in-production': 'warn',
  },
};
