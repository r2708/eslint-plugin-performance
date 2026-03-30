const { ARRAY_METHODS, addLoopListeners } = require('../utils');

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Detect JSON.parse() and JSON.stringify() calls inside loops',
      category: 'performance',
      recommended: true
    },
    schema: []
  },
  create(context) {
    let loopDepth = 0;

    const JSON_EXPENSIVE_METHODS = new Set(['parse', 'stringify']);

    /**
     * If the call is JSON.parse() or JSON.stringify(), returns the method name; otherwise null.
     * @param {ASTNode} node - The CallExpression node
     * @returns {string|null}
     */
    function getExpensiveJSONMethod(node) {
      const { callee } = node;
      if (!callee || callee.type !== 'MemberExpression') return null;

      const { object, property } = callee;
      if (object.type === 'Identifier' && object.name === 'JSON' &&
          property.type === 'Identifier' && JSON_EXPENSIVE_METHODS.has(property.name)) {
        return property.name;
      }
      return null;
    }

    function onLoopEnter() { loopDepth++; }
    function onLoopExit() { loopDepth--; }

    const listeners = {};
    addLoopListeners(listeners, onLoopEnter, onLoopExit);

    listeners.CallExpression = (node) => {
      if (node.callee && node.callee.type === 'MemberExpression') {
        const methodName = node.callee.property.name;
        if (ARRAY_METHODS.includes(methodName)) {
          onLoopEnter();
        }
      }

      if (loopDepth > 0) {
        const jsonMethod = getExpensiveJSONMethod(node);
        if (jsonMethod) {
          context.report({
            node,
            message: `JSON.${jsonMethod}() inside a loop causes repeated expensive serialization on every iteration`
          });
        }
      }
    };

    listeners['CallExpression:exit'] = (node) => {
      if (node.callee && node.callee.type === 'MemberExpression' &&
          ARRAY_METHODS.includes(node.callee.property.name)) {
        onLoopExit();
      }
    };

    return listeners;
  }
};
