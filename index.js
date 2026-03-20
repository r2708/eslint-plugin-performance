module.exports = {
  rules: {
    'no-quadratic-loops': require('./src/lib/rules/no-quadratic-loops'),
    'no-sync-in-loop': require('./src/lib/rules/no-sync-in-loop'),
    'no-large-json-parse-in-loop': require('./src/lib/rules/no-large-json-parse-in-loop'),
    'react-no-inline-object-creation': require('./src/lib/rules/react-no-inline-object-creation'),
    'no-unnecessary-array-clone': require('./src/lib/rules/no-unnecessary-array-clone'),
    'no-await-in-loop': require('./src/lib/rules/no-await-in-loop'),
    'no-regex-in-loop': require('./src/lib/rules/no-regex-in-loop'),
    'no-dom-query-in-loop': require('./src/lib/rules/no-dom-query-in-loop'),
    'prefer-map-over-reduce': require('./src/lib/rules/prefer-map-over-reduce'),
    'no-object-spread-in-loop': require('./src/lib/rules/no-object-spread-in-loop'),
    'no-console-in-production': require('./src/lib/rules/no-console-in-production')
  },
  configs: {
    recommended: {
      plugins: ['performance'],
      rules: {
        'performance/no-quadratic-loops': 'warn',
        'performance/no-sync-in-loop': 'warn',
        'performance/no-large-json-parse-in-loop': 'warn',
        'performance/react-no-inline-object-creation': 'warn',
        'performance/no-unnecessary-array-clone': 'warn',
        'performance/no-await-in-loop': 'warn',
        'performance/no-regex-in-loop': 'warn',
        'performance/no-dom-query-in-loop': 'warn',
        'performance/prefer-map-over-reduce': 'warn',
        'performance/no-object-spread-in-loop': 'warn',
        'performance/no-console-in-production': 'warn'
      }
    }
  }
};
