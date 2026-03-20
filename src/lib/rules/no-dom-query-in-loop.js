module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Detect DOM queries inside loops',
      category: 'performance',
      recommended: true
    },
    schema: []
  },
  create(context) {
    let loopDepth = 0;

    function onLoopEnter() { loopDepth++; }
    function onLoopExit() { loopDepth--; }

    const DOM_QUERY_METHODS = new Set([
      'querySelector', 'querySelectorAll',
      'getElementById', 'getElementsByClassName',
      'getElementsByTagName', 'getElementsByName'
    ]);

    // Objects that are known DOM query roots
    const DOM_ROOTS = new Set(['document', 'window']);

    function isDomQuery(callee) {
      if (callee.type !== 'MemberExpression') return false;
      if (!DOM_QUERY_METHODS.has(callee.property.name)) return false;
      const obj = callee.object;
      // Only flag when called on a known DOM root (document, window)
      // or on a chained member expression (e.g. document.body.querySelector)
      if (obj.type === 'Identifier') return DOM_ROOTS.has(obj.name);
      if (obj.type === 'MemberExpression') {
        // walk to the root identifier
        let root = obj;
        while (root.type === 'MemberExpression') root = root.object;
        return root.type === 'Identifier' && DOM_ROOTS.has(root.name);
      }
      return false;
    }

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

    listeners.CallExpression = (node) => {
      const { callee } = node;

      if (callee?.type === 'MemberExpression' &&
          arrayMethods.includes(callee.property.name)) {
        onLoopEnter();
        return;
      }

      if (loopDepth > 0 && callee?.type === 'MemberExpression') {
        const method = callee.property.name;
        if (DOM_QUERY_METHODS.has(method) && isDomQuery(callee)) {
          context.report({
            node,
            message: `Avoid ${method}() inside loops. Cache the DOM query result outside the loop.`
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

    return listeners;
  }
};
