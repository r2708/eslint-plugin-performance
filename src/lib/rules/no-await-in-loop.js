module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Detect await expressions inside loops',
      category: 'performance',
      recommended: true
    },
    hasSuggestions: true,
    schema: []
  },
  create(context) {
    let loopDepth = 0;

    function onLoopEnter() { loopDepth++; }
    function onLoopExit() { loopDepth--; }

    return {
      ForStatement: onLoopEnter,
      'ForStatement:exit': onLoopExit,
      ForOfStatement: onLoopEnter,
      'ForOfStatement:exit': onLoopExit,
      ForInStatement: onLoopEnter,
      'ForInStatement:exit': onLoopExit,
      WhileStatement: onLoopEnter,
      'WhileStatement:exit': onLoopExit,
      DoWhileStatement: onLoopEnter,
      'DoWhileStatement:exit': onLoopExit,

      AwaitExpression(node) {
        if (loopDepth > 0) {
          context.report({
            node,
            message: 'Avoid await inside loops. Use Promise.all() to run promises concurrently.',
            suggest: [
              {
                desc: 'Use Promise.all() for concurrent execution',
                fix(fixer) {
                  return fixer.insertTextBefore(node, '/* Consider: await Promise.all([...]) */ ');
                }
              }
            ]
          });
        }
      }
    };
  }
};
