module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Detect array cloning when the cloned array is never mutated',
      category: 'performance',
      recommended: true
    },
    schema: []
  },
  create(context) {
    /**
     * Check if a node represents an array cloning pattern
     * @param {ASTNode} node - The node to check
     * @returns {boolean} - True if it's a cloning pattern
     */
    function isCloningPattern(node) {
      if (!node) {
        return false;
      }

      // Pattern 1: Spread operator [...arr]
      if (node.type === 'ArrayExpression' &&
          node.elements.length === 1 &&
          node.elements[0] &&
          node.elements[0].type === 'SpreadElement') {
        return true;
      }

      // Pattern 2: Array.from(arr)
      if (node.type === 'CallExpression' &&
          node.callee &&
          node.callee.type === 'MemberExpression' &&
          node.callee.object &&
          node.callee.object.type === 'Identifier' &&
          node.callee.object.name === 'Array' &&
          node.callee.property &&
          node.callee.property.name === 'from') {
        return true;
      }

      // Pattern 3: arr.slice() with no arguments
      if (node.type === 'CallExpression' &&
          node.callee &&
          node.callee.type === 'MemberExpression' &&
          node.callee.property &&
          node.callee.property.name === 'slice' &&
          node.arguments.length === 0) {
        return true;
      }

      return false;
    }

    /**
     * Check if a reference represents a mutation
     * @param {Reference} reference - The variable reference to check
     * @returns {boolean} - True if it's a mutating reference
     */
    function isMutatingReference(reference) {
      const identifier = reference.identifier;
      const parent = identifier.parent;

      if (!parent) {
        return false;
      }

      // Pattern 1: Assignment expression (clone[0] = value)
      if (parent.type === 'AssignmentExpression' && parent.left === identifier) {
        return true;
      }

      // Pattern 2: Member expression for array index assignment (clone[0] = value)
      if (parent.type === 'MemberExpression' && parent.object === identifier) {
        const grandparent = parent.parent;
        
        // Check if the member expression is on the left side of an assignment
        if (grandparent && 
            grandparent.type === 'AssignmentExpression' && 
            grandparent.left === parent) {
          return true;
        }

        // Check if it's a mutating method call
        if (grandparent && grandparent.type === 'CallExpression') {
          const methodName = parent.property.name;
          const mutatingMethods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];
          
          if (mutatingMethods.includes(methodName)) {
            return true;
          }
        }
      }

      return false;
    }

    /**
     * Check if a variable is mutated in its scope
     * @param {Variable} variable - The variable to check
     * @returns {boolean} - True if the variable is mutated
     */
    function isVariableMutated(variable) {
      if (!variable || !variable.references) {
        return false;
      }

      // Check all references to the variable
      for (const reference of variable.references) {
        // Skip the initial declaration/write
        if (reference.init) {
          continue;
        }

        if (isMutatingReference(reference)) {
          return true;
        }
      }

      return false;
    }

    return {
      VariableDeclarator(node) {
        // Check if this is a cloning pattern
        if (!isCloningPattern(node.init)) {
          return;
        }

        // Get the variable name
        if (!node.id || node.id.type !== 'Identifier') {
          return;
        }

        const variableName = node.id.name;

        // Get the scope and find the variable
        const sourceCode = context.sourceCode || context.getSourceCode();
        const scope = sourceCode.getScope(node);
        const variable = scope.set.get(variableName);

        if (!variable) {
          return;
        }

        // Check if the variable is mutated
        if (!isVariableMutated(variable)) {
          context.report({
            node,
            message: 'Unnecessary array clone - array is never mutated'
          });
        }
      }
    };
  }
};
