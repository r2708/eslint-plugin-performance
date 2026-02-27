module.exports = {
  rules: {
    'no-quadratic-loops': require('./lib/rules/no-quadratic-loops'),
    'no-sync-in-loop': require('./lib/rules/no-sync-in-loop'),
    'no-large-json-parse-in-loop': require('./lib/rules/no-large-json-parse-in-loop'),
    'react-no-inline-object-creation': require('./lib/rules/react-no-inline-object-creation'),
    'no-unnecessary-array-clone': require('./lib/rules/no-unnecessary-array-clone')
  },
  configs: {
    recommended: {
      plugins: ['performance'],
      rules: {
        'performance/no-quadratic-loops': 'warn',
        'performance/no-sync-in-loop': 'warn',
        'performance/no-large-json-parse-in-loop': 'warn',
        'performance/react-no-inline-object-creation': 'warn',
        'performance/no-unnecessary-array-clone': 'warn'
      }
    }
  }
};
