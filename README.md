# eslint-plugin-performance

ESLint plugin to detect performance anti-patterns in JavaScript and TypeScript codebases. This plugin helps identify code patterns that may cause runtime performance degradation through static AST analysis.

## Features

- 🔍 Detects quadratic loop complexity (O(n²) patterns)
- 🚫 Identifies synchronous blocking calls in loops
- ⚡ Catches expensive JSON parsing in loops
- ⚛️ Finds React inline object creation causing re-renders
- 🎯 Detects unnecessary array cloning
- 📊 Performance score formatter with impact assessment
- 🔧 Works with JavaScript and TypeScript
- ✅ Zero runtime dependencies

## Installation

```bash
npm install eslint-plugin-performance --save-dev
```

## Configuration

### ESLint Configuration (.eslintrc.json)

```json
{
  "plugins": ["performance"],
  "extends": ["plugin:performance/recommended"]
}
```

Or configure rules individually:

```json
{
  "plugins": ["performance"],
  "rules": {
    "performance/no-quadratic-loops": "warn",
    "performance/no-sync-in-loop": "warn",
    "performance/no-large-json-parse-in-loop": "warn",
    "performance/react-no-inline-object-creation": "warn",
    "performance/no-unnecessary-array-clone": "warn"
  }
}
```

### Flat Config (eslint.config.js)

```javascript
const performancePlugin = require('eslint-plugin-performance');

module.exports = [
  {
    plugins: {
      performance: performancePlugin
    },
    rules: {
      'performance/no-quadratic-loops': 'warn',
      'performance/no-sync-in-loop': 'warn',
      'performance/no-large-json-parse-in-loop': 'warn',
      'performance/react-no-inline-object-creation': 'warn',
      'performance/no-unnecessary-array-clone': 'warn'
    }
  }
];
```

Or use the recommended configuration:

```javascript
const performancePlugin = require('eslint-plugin-performance');

module.exports = [
  {
    plugins: {
      performance: performancePlugin
    },
    rules: performancePlugin.configs.recommended.rules
  }
];
```

### TypeScript Configuration

For TypeScript projects, configure the parser:

**.eslintrc.json:**

```json
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "plugins": ["performance"],
  "extends": ["plugin:performance/recommended"]
}
```

**eslint.config.js:**

```javascript
const performancePlugin = require('eslint-plugin-performance');
const tsParser = require('@typescript-eslint/parser');

module.exports = [
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      performance: performancePlugin
    },
    rules: performancePlugin.configs.recommended.rules
  }
];
```

## Rules

### no-quadratic-loops
Detects nested loops that iterate over the same array reference, which causes O(n²) algorithmic complexity.

**Rationale:** Nested loops over the same array create quadratic time complexity, causing exponential performance degradation as data size grows. A 1000-item array becomes 1,000,000 iterations. Detects synchronous blocking calls (fs.*Sync, child_process.*Sync) inside loops that block the event loop repeatedly.

**Rationale:** Synchronous file system and process operations block the Node.js event loop. Calling them in a loop multiplies the blocking time, freezing your application for extended periods.

### no-large-json-parse-in-loop
Detects JSON.parse() calls inside loops, which causes repeated expensive parsing operations.

**Rationale:** JSON parsing is CPU-intensive. Parsing JSON repeatedly in a loop wastes processing time. Parse once before the loop or restructure your data flow.

### react-no-inline-object-creation
Detects inline object literals, array literals, and arrow functions in JSX props that cause unnecessary re-renders.

**Rationale:** Creating new objects, arrays, or functions inline in JSX creates a new reference on every render. This causes child components to re-render even when the actual values haven't changed, breaking React's reconciliation optimization.


### no-unnecessary-array-clone

Detects array cloning operations (spread operator, Array.from(), slice()) when the cloned array is never mutated.

**Rationale:** Cloning arrays allocates new memory and copies all elements. If you never mutate the clone, you're wasting memory and CPU cycles. Use the original array reference instead.

## Usage

### Running ESLint
```bash
# Standard ESLint run
npx eslint .

# With auto-fix (where applicable)
npx eslint . --fix

# Check specific files
npx eslint src/**/*.js
```

### Example CLI Output

```
/project/src/utils/data.js
  12:3  warning  Nested loop iterates over same array, causing O(n²) complexity  performance/no-quadratic-loops
  28:5  warning  Synchronous blocking call inside loop blocks event loop         performance/no-sync-in-loop

/project/src/components/UserList.jsx
  15:23  warning  Inline object creation in JSX prop causes re-renders  performance/react-no-inline-object-creation
  16:21  warning  Inline arrow function in JSX prop causes re-renders   performance/react-no-inline-object-creation

✖ 4 problems (0 errors, 4 warnings)
```

### Performance Formatter

Use the custom performance formatter to get an aggregated performance score:
```bash
npx eslint . --format ./node_modules/eslint-plugin-performance/lib/formatters/performance.js
```

## Contributing
Contributions are welcome! Please open an issue or submit a pull request on GitHub.

## License
MIT