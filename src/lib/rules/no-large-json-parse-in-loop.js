const { ARRAY_METHODS } = require('../utils');

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Detect JSON.parse() calls inside loops',
      category: 'performance',
      recommended: true
    },
    schema: []
  },
  create(context) {
    let loopDepth = 0;

    /**
     * Check if a CallExpression node is a JSON.parse call
     * @param {ASTNode} node - The CallExpression node
     * @returns {boolean} - True if it's a JSON.parse call
     */
    function isJSONParse(node) {
      const { callee } = node;
      
      // Must be a MemberExpression (e.g., JSON.parse)
      if (!callee || callee.type !== 'MemberExpression') {
        return false;
      }

      // Get the object and property nodes
      const objectNode = callee.object;
      const propertyNode = callee.property;

      // Check for JSON.parse pattern
      if (objectNode.type === 'Identifier' && propertyNode.type === 'Identifier') {
        const objectName = objectNode.name;
        const propertyName = propertyNode.name;

        if (objectName === 'JSON' && propertyName === 'parse') {
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
          const arrayMethods = ARRAY_METHODS;
          
          if (arrayMethods.includes(methodName)) {
            onLoopEnter();
          }
        }

        // Check for JSON.parse calls inside loops
        if (loopDepth > 0 && isJSONParse(node)) {
          context.report({
            node,
            message: 'JSON.parse() inside loop causes repeated expensive parsing operations'
          });
        }
      },
      
      'CallExpression:exit'(node) {
        // Handle array method exit
        if (node.callee && node.callee.type === 'MemberExpression') {
          const methodName = node.callee.property.name;
          const arrayMethods = ARRAY_METHODS;
          
          if (arrayMethods.includes(methodName)) {
            onLoopExit();
          }
        }
      }
    };
  }
};
