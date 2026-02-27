module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Detect synchronous blocking calls inside loops',
      category: 'performance',
      recommended: true
    },
    schema: []
  },
  create(context) {
    let loopDepth = 0;

    /**
     * Check if a CallExpression node is a blocking synchronous call
     * @param {ASTNode} node - The CallExpression node
     * @returns {boolean} - True if it's a blocking call
     */
    function isBlockingCall(node) {
      const { callee } = node;
      
      // Must be a MemberExpression (e.g., fs.readFileSync, child_process.execSync)
      if (!callee || callee.type !== 'MemberExpression') {
        return false;
      }

      // Get the object and property names
      const objectNode = callee.object;
      const propertyNode = callee.property;

      // Handle simple cases: fs.readFileSync, child_process.execSync
      if (objectNode.type === 'Identifier' && propertyNode.type === 'Identifier') {
        const objectName = objectNode.name;
        const propertyName = propertyNode.name;

        // Check for fs.*Sync patterns
        if (objectName === 'fs' && propertyName.endsWith('Sync')) {
          return true;
        }

        // Check for child_process.*Sync patterns
        if (objectName === 'child_process' && propertyName.endsWith('Sync')) {
          return true;
        }
      }

      return false;
    }

    /**
     * Handle loop entry - increment depth counter
     */
    function onLoopEnter() {
      loopDepth++;
    }

    /**
     * Handle loop exit - decrement depth counter
     */
    function onLoopExit() {
      loopDepth--;
    }

    return {
      // Traditional loop statements
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

      // Array method calls (forEach, map, filter, etc.)
      CallExpression(node) {
        // Check if this is an array method that acts as a loop
        if (node.callee && node.callee.type === 'MemberExpression') {
          const methodName = node.callee.property.name;
          const arrayMethods = ['forEach', 'map', 'filter', 'reduce', 'some', 'every', 'find'];
          
          if (arrayMethods.includes(methodName)) {
            onLoopEnter();
          }
        }

        // Check for blocking calls inside loops
        if (loopDepth > 0 && isBlockingCall(node)) {
          context.report({
            node,
            message: 'Synchronous blocking call inside loop blocks the event loop repeatedly'
          });
        }
      },
      
      'CallExpression:exit'(node) {
        // Handle array method exit
        if (node.callee && node.callee.type === 'MemberExpression') {
          const methodName = node.callee.property.name;
          const arrayMethods = ['forEach', 'map', 'filter', 'reduce', 'some', 'every', 'find'];
          
          if (arrayMethods.includes(methodName)) {
            onLoopExit();
          }
        }
      }
    };
  }
};
