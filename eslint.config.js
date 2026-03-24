const plugin = require('./index');

module.exports = [
  {
    // Lint the plugin's own rule source files
    files: ['src/**/*.js'],
    ...plugin.configs.recommended,
  },
  {
    // Ignore generated/dependency dirs
    ignores: ['node_modules/**', 'coverage/**'],
  },
];
