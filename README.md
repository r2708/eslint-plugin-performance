# eslint-plugin-performance-rules

ESLint plugin to detect performance anti-patterns in JavaScript and TypeScript codebases. Identifies code patterns that cause runtime performance degradation through static AST analysis.

## Features

- 🔍 Detects quadratic loop complexity (O(n²) patterns)
- 🚫 Identifies synchronous blocking calls in loops
- ⚡ Catches expensive JSON parsing in loops
- ⚛️ Finds React inline object creation causing re-renders
- 🎯 Detects unnecessary array cloning
- ⏳ Detects await inside loops (use Promise.all instead)
- 🔤 Catches regex compilation inside loops
- 🌐 Detects DOM queries inside loops
- 🗺️ Flags O(n) array lookups inside loops (prefer Map/Set)
- 📦 Detects object spread inside loops
- 🖥️ Disallows console calls in production code
- 🔧 Works with JavaScript and TypeScript
- ✅ Zero runtime dependencies

## Installation

```bash
npm install eslint-plugin-performance-rules --save-dev
```

## Configuration

### ESLint v9+ (Flat Config — `eslint.config.js`)

```js
const perfPlugin = require('eslint-plugin-performance-rules');

module.exports = [
  perfPlugin.configs.recommended,
];
```

Or configure rules individually:

```js
const perfPlugin = require('eslint-plugin-performance-rules');

module.exports = [
  {
    plugins: { 'performance-rules': perfPlugin },
    rules: {
      'performance-rules/no-quadratic-loops': 'warn',
      'performance-rules/no-await-in-loop': 'warn',
      'performance-rules/no-regex-in-loop': 'warn',
      'performance-rules/no-console-in-production': 'warn',
      // ...add more as needed
    },
  },
];
```

### ESLint v7/v8 (Legacy Config — `.eslintrc.js`)

```js
module.exports = {
  plugins: ['performance-rules'],
  extends: ['plugin:performance-rules/recommended-legacy'],
};
```

Or configure rules individually:

```js
module.exports = {
  plugins: ['performance-rules'],
  rules: {
    'performance-rules/no-quadratic-loops': 'warn',
    'performance-rules/no-await-in-loop': 'warn',
    'performance-rules/no-regex-in-loop': 'warn',
    'performance-rules/no-console-in-production': 'warn',
  },
};
```

### TypeScript Projects

```js
// eslint.config.js
const perfPlugin = require('eslint-plugin-performance-rules');
const tsParser = require('@typescript-eslint/parser');

module.exports = [
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
    },
    ...perfPlugin.configs.recommended,
  },
];
```

## Rules

| Rule | Description | Default |
|------|-------------|---------|
| `no-quadratic-loops` | Detects nested loops over the same array — O(n²) complexity | warn |
| `no-sync-in-loop` | Detects `fs.*Sync` / `child_process.*Sync` calls inside loops | warn |
| `no-large-json-parse-in-loop` | Detects `JSON.parse()` inside loops | warn |
| `react-no-inline-object-creation` | Detects inline objects/arrays/functions in JSX props | warn |
| `no-unnecessary-array-clone` | Detects array clones that are never mutated | warn |
| `no-await-in-loop` | Detects `await` inside loops — use `Promise.all()` instead | warn |
| `no-regex-in-loop` | Detects regex literals / `new RegExp()` inside loops | warn |
| `no-dom-query-in-loop` | Detects `document.querySelector` and friends inside loops | warn |
| `prefer-map-over-reduce` | Flags `array.find/filter/includes` inside loops — O(n²) | warn |
| `no-object-spread-in-loop` | Detects `{...obj}` / `Object.assign({}, ...)` inside loops | warn |
| `no-console-in-production` | Disallows `console.*` calls (except `error`/`warn` by default) | warn |

## Rule Details

### no-quadratic-loops
```js
// Bad
for (const a of arr) {
  for (const b of arr) { } // O(n²)
}

// Good
const set = new Set(arr);
for (const a of arr) { set.has(a); }
```

### no-await-in-loop
```js
// Bad
for (const url of urls) {
  await fetch(url); // sequential
}

// Good
await Promise.all(urls.map(url => fetch(url)));
```

### no-regex-in-loop
```js
// Bad
for (const s of strings) {
  /foo/.test(s); // recompiled every iteration
}

// Good
const re = /foo/;
for (const s of strings) { re.test(s); }
```

### no-dom-query-in-loop
```js
// Bad
for (const item of items) {
  document.querySelector('.list').appendChild(item);
}

// Good
const list = document.querySelector('.list');
for (const item of items) { list.appendChild(item); }
```

### prefer-map-over-reduce
```js
// Bad — O(n²)
for (const id of ids) {
  users.find(u => u.id === id);
}

// Good — O(1) lookup
const userMap = new Map(users.map(u => [u.id, u]));
for (const id of ids) { userMap.get(id); }
```

### no-object-spread-in-loop
```js
// Bad — new object every iteration
for (const item of arr) {
  const copy = { ...item };
}

// Good
const target = {};
for (const item of arr) { Object.assign(target, item); }
```

### no-console-in-production
```js
// Bad
console.log('debug value:', x);

// Good
console.error('something broke'); // error/warn allowed by default
```

Configure allowed methods:
```js
// eslint.config.js
rules: {
  'performance-rules/no-console-in-production': ['warn', { allow: ['error', 'warn', 'info'] }]
}
```

## Usage

```bash
# Run ESLint
npx eslint .

# With performance formatter
npx eslint . --format ./node_modules/eslint-plugin-performance-rules/src/lib/formatters/performance.js
```

## License

MIT
