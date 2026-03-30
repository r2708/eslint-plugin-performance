const { ARRAY_METHODS, addLoopListeners } = require('../utils');

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Detect regex literal compilation inside loops',
      category: 'performance',
      recommended: true
    },
    schema: []
  },
  create(context) {
    let loopDepth = 0;

    function onLoopEnter() { loopDepth++; }
    function onLoopExit() { loopDepth--; }

    const listeners = {};
    addLoopListeners(listeners, onLoopEnter, onLoopExit);

    listeners.CallExpression = (node) => {
      if (node.callee?.type === 'MemberExpression' &&
          !node.callee.computed &&
          ARRAY_METHODS.includes(node.callee.property?.name)) {
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

    listeners.Literal = (node) => {
      if (loopDepth > 0 && node.regex) {
        context.report({
          node,
          message: 'Avoid regex literals inside loops. Move the regex outside the loop to avoid recompilation on each iteration.'
        });
      }
    };

    listeners.NewExpression = (node) => {
      if (loopDepth > 0 &&
          node.callee?.type === 'Identifier' &&
          node.callee.name === 'RegExp') {
        context.report({
          node,
          message: 'Avoid new RegExp() inside loops. Move the regex outside the loop to avoid recompilation on each iteration.'
        });
      }
    };

    return listeners;
  }
};
