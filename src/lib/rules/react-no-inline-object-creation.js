module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Detect inline object, array, and function creation in JSX props',
      category: 'performance',
      recommended: true
    },
    schema: []
  },
  create(context) {
    /**
     * Check if an expression is an inline creation pattern
     * @param {ASTNode} expression - The expression node to check
     * @returns {string|null} - The type of inline creation or null
     */
    function getInlineCreationType(expression) {
      if (!expression) {
        return null;
      }

      switch (expression.type) {
        case 'ObjectExpression':
          return 'object';
        
        case 'ArrayExpression':
          return 'array';
        
        case 'ArrowFunctionExpression':
        case 'FunctionExpression':
          return 'function';
        
        default:
          return null;
      }
    }

    /**
     * Get appropriate message for the inline creation type
     * @param {string} type - The type of inline creation
     * @returns {string} - The warning message
     */
    function getMessage(type) {
      switch (type) {
        case 'object':
          return 'Inline object creation in JSX prop causes unnecessary re-renders';
        
        case 'array':
          return 'Inline array creation in JSX prop causes unnecessary re-renders';
        
        case 'function':
          return 'Inline function creation in JSX prop causes unnecessary re-renders';
        
        default:
          return 'Inline creation in JSX prop causes unnecessary re-renders';
      }
    }

    return {
      JSXAttribute(node) {
        // Check if the attribute has a value
        if (!node.value) {
          return;
        }

        // Check if the value is a JSXExpressionContainer
        if (node.value.type === 'JSXExpressionContainer') {
          const expression = node.value.expression;
          const creationType = getInlineCreationType(expression);

          if (creationType) {
            context.report({
              node: node.value,
              message: getMessage(creationType)
            });
          }
        }
      }
    };
  }
};
