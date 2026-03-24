const rules = {
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
  'no-console-in-production': require('./src/lib/rules/no-console-in-production'),
};

const plugin = {
  meta: {
    name: 'eslint-plugin-performance-rules',
    version: require('./package.json').version,
  },
  rules,
  // Legacy config (ESLint v7/v8, .eslintrc)
  configs: {},
};

// Flat config (ESLint v9+, eslint.config.js)
const recommendedRules = Object.fromEntries(
  Object.keys(rules).map((name) => [`performance-rules/${name}`, 'warn'])
);

plugin.configs.recommended = {
  plugins: { 'performance-rules': plugin },
  rules: recommendedRules,
};

// Legacy recommended (for .eslintrc users)
plugin.configs['recommended-legacy'] = {
  plugins: ['performance-rules'],
  rules: Object.fromEntries(
    Object.keys(rules).map((name) => [`performance-rules/${name}`, 'warn'])
  ),
};

module.exports = plugin;
