module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow console calls that impact production performance',
      category: 'performance',
      recommended: true
    },
    schema: [
      {
        type: 'object',
        properties: {
          allow: {
            type: 'array',
            items: { type: 'string' },
            uniqueItems: true,
            default: ['error', 'warn']
          }
        },
        additionalProperties: false
      }
    ]
  },
  create(context) {
    const options = context.options[0] || {};
    const allowed = new Set(options.allow || ['error', 'warn']);

    return {
      CallExpression(node) {
        const { callee } = node;
        if (callee?.type !== 'MemberExpression') return;
        if (callee.object?.name !== 'console') return;

        const method = callee.property.name;
        if (!allowed.has(method)) {
          context.report({
            node,
            message: `console.${method}() should not be used in production code. Remove or replace with a proper logger.`
          });
        }
      }
    };
  }
};
