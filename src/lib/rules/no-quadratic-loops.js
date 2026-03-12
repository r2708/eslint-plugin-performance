module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Detect nested loops iterating over the same array reference',
      category: 'performance',
      recommended: true
    },
    schema: []
  },
  create(context) {
    const loopStack = [];

    /**
     * Extract the iteration target from a loop node
     * @param {ASTNode} node - The loop node
     * @returns {ASTNode|null} - The iteration target node or null
     */
    function extractIterationTarget(node) {
      switch (node.type) {
        case 'ForOfStatement':
        case 'ForInStatement':
          // for (item of array) or for (key in object)
          return node.right;

        case 'ForStatement':
          // for (let i = 0; i < array.length; i++)
          // Look for array.length pattern in the test condition
          if (node.test && node.test.type === 'BinaryExpression') {
            const { left, right } = node.test;
            
            // Check if right side is array.length
            if (right && right.type === 'MemberExpression' && 
                right.property && right.property.name === 'length') {
              return right.object;
            }
            
            // Check if left side is array.length
            if (left && left.type === 'MemberExpression' && 
                left.property && left.property.name === 'length') {
              return left.object;
            }
          }
          return null;

        case 'WhileStatement':
        case 'DoWhileStatement':
          // While loops are harder to analyze, skip for now
          return null;

        case 'CallExpression':
          // array.forEach(), array.map(), etc.
          if (node.callee && node.callee.type === 'MemberExpression') {
            const methodName = node.callee.property.name;
            const arrayMethods = ['forEach', 'map', 'filter', 'reduce', 'some', 'every', 'find'];
            
            if (arrayMethods.includes(methodName)) {
              return node.callee.object;
            }
          }
          return null;

        default:
          return null;
      }
    }

    /**
     * Check if two AST nodes represent the same reference
     * @param {ASTNode} node1 - First node
     * @param {ASTNode} node2 - Second node
     * @returns {boolean} - True if they represent the same reference
     */
    function isSameReference(node1, node2) {
      if (!node1 || !node2) {
        return false;
      }

      // Both are simple identifiers
      if (node1.type === 'Identifier' && node2.type === 'Identifier') {
        return node1.name === node2.name;
      }

      // Both are member expressions (e.g., obj.arr)
      if (node1.type === 'MemberExpression' && node2.type === 'MemberExpression') {
        return isSameReference(node1.object, node2.object) &&
               isSameReference(node1.property, node2.property);
      }

      return false;
    }

    /**
     * Check if the current loop iterates over the same reference as any outer loop
     * @param {ASTNode} target - The iteration target of the current loop
     * @returns {boolean} - True if a match is found
     */
    function checkForQuadraticPattern(target) {
      for (const outerLoop of loopStack) {
        if (isSameReference(target, outerLoop.target)) {
          return true;
        }
      }
      return false;
    }

    /**
     * Handle loop entry
     * @param {ASTNode} node - The loop node
     */
    function onLoopEnter(node) {
      const target = extractIterationTarget(node);
      
      if (target && checkForQuadraticPattern(target)) {
        context.report({
          node,
          message: 'Nested loop iterates over the same array reference, causing O(n²) complexity'
        });
      }

      loopStack.push({ node, target });
    }

    /**
     * Handle loop exit
     */
    function onLoopExit() {
      loopStack.pop();
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
        if (node.callee && node.callee.type === 'MemberExpression') {
          const methodName = node.callee.property.name;
          const arrayMethods = ['forEach', 'map', 'filter', 'reduce', 'some', 'every', 'find'];
          
          if (arrayMethods.includes(methodName)) {
            onLoopEnter(node);
          }
        }
      },
      
      'CallExpression:exit'(node) {
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
