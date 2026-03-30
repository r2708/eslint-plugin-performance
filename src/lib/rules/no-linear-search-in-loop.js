const { ARRAY_METHODS, addLoopListeners } = require('../utils');

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Detect O(n) array lookups (find/filter/includes/indexOf/findIndex) inside loops — use a Map or Set for O(1) lookups',
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

    const listeners = {};
    addLoopListeners(listeners, onLoopEnter, onLoopExit);

    listeners.CallExpression = (node) => {
      const { callee } = node;
      if (!callee || callee.type !== 'MemberExpression' || callee.computed) return;

      const method = callee.property?.name;
      if (!method) return;

      // Flag O(n) lookups *before* potentially entering a new loop scope,
      // so a top-level arr.find() doesn't flag itself.
      if (loopDepth > 0 && LOOKUP_METHODS.has(method)) {
        context.report({
          node,
          message: `Array.${method}() inside a loop is O(n²). Consider building a Map or Set outside the loop for O(1) lookups.`
        });
      }

      // Track array iteration methods as loop scopes
      if (ARRAY_METHODS.includes(method)) {
        onLoopEnter();
      }
    };

    listeners['CallExpression:exit'] = (node) => {
      if (node.callee?.type === 'MemberExpression' &&
          !node.callee.computed &&
          ARRAY_METHODS.includes(node.callee.property?.name)) {
        onLoopExit();
      }
    };

    return listeners;
  }
};
