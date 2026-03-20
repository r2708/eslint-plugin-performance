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

    const loopNodes = [
      'ForStatement', 'ForOfStatement', 'ForInStatement',
      'WhileStatement', 'DoWhileStatement'
    ];

    const listeners = {};

    for (const loop of loopNodes) {
      listeners[loop] = onLoopEnter;
      listeners[`${loop}:exit`] = onLoopExit;
    }

    const arrayMethods = ['forEach', 'map', 'filter', 'reduce', 'some', 'every', 'find'];

    listeners.CallExpression = (node) => {
      if (node.callee?.type === 'MemberExpression' &&
          arrayMethods.includes(node.callee.property.name)) {
        onLoopEnter();
      }
    };

    listeners['CallExpression:exit'] = (node) => {
      if (node.callee?.type === 'MemberExpression' &&
          arrayMethods.includes(node.callee.property.name)) {
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
