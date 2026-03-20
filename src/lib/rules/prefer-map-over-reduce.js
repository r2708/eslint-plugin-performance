module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer Map/object lookup O(1) over array.find/filter O(n) for repeated lookups',
      category: 'performance',
      recommended: true
    },
    schema: []
  },
  create(context) {
    let loopDepth = 0;

    function onLoopEnter() { loopDepth++; }
    function onLoopExit() { loopDepth--; }

    const LOOKUP_METHODS = new Set(['find', 'findIndex', 'filter', 'includes', 'indexOf']);

    const arrayMethods = ['forEach', 'map', 'filter', 'reduce', 'some', 'every', 'find'];

    const loopNodes = [
      'ForStatement', 'ForOfStatement', 'ForInStatement',
      'WhileStatement', 'DoWhileStatement'
    ];

    const listeners = {};

    for (const loop of loopNodes) {
      listeners[loop] = onLoopEnter;
      listeners[`${loop}:exit`] = onLoopExit;
    }

    listeners.CallExpression = (node) => {
      const { callee } = node;
      if (!callee || callee.type !== 'MemberExpression') return;

      const method = callee.property.name;

      // Flag O(n) lookups *before* potentially entering a new loop scope,
      // so a top-level arr.find() doesn't flag itself.
      if (loopDepth > 0 && LOOKUP_METHODS.has(method)) {
        context.report({
          node,
          message: `Array.${method}() inside a loop is O(n²). Consider building a Map or Set outside the loop for O(1) lookups.`
        });
      }

      // Track array iteration methods as loop scopes
      if (arrayMethods.includes(method)) {
        onLoopEnter();
      }
    };

    listeners['CallExpression:exit'] = (node) => {
      if (node.callee?.type === 'MemberExpression' &&
          arrayMethods.includes(node.callee.property.name)) {
        onLoopExit();
      }
    };

    return listeners;
  }
};
