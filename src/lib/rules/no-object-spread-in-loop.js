module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Detect object spread inside loops which causes repeated heap allocations',
      category: 'performance',
      recommended: true
    },
    schema: []
  },
  create(context) {
    let loopDepth = 0;

    function onLoopEnter() { loopDepth++; }
    function onLoopExit() { loopDepth--; }

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

    // Single CallExpression handler — handles both array method loop tracking
    // and Object.assign({}, ...) detection. SpreadElement handles {...obj}.
    listeners.CallExpression = (node) => {
      const { callee } = node;
      if (!callee || callee.type !== 'MemberExpression') return;

      if (arrayMethods.includes(callee.property.name)) {
        onLoopEnter();
        return;
      }

      if (loopDepth > 0 &&
          callee.object?.name === 'Object' &&
          callee.property?.name === 'assign') {
        const firstArg = node.arguments[0];
        if (firstArg?.type === 'ObjectExpression' && firstArg.properties.length === 0) {
          context.report({
            node,
            message: 'Object.assign({}, ...) inside a loop allocates a new object on every iteration. Consider pre-allocating the target object outside the loop.'
          });
        }
      }
    };

    listeners['CallExpression:exit'] = (node) => {
      if (node.callee?.type === 'MemberExpression' &&
          arrayMethods.includes(node.callee.property.name)) {
        onLoopExit();
      }
    };

    listeners.SpreadElement = (node) => {
      if (loopDepth > 0 && node.parent?.type === 'ObjectExpression') {
        context.report({
          node,
          message: 'Object spread inside a loop creates a new object on every iteration. Consider mutating outside the loop or using Object.assign() with a pre-allocated object.'
        });
      }
    };

    return listeners;
  }
};
