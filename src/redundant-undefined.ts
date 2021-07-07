import {
  AST_NODE_TYPES,
  ESLintUtils,
  TSESTree,
} from '@typescript-eslint/experimental-utils';

const createRule = ESLintUtils.RuleCreator(() => '');

export default createRule({
  name: 'redundant-undefined',
  meta: {
    docs: {
      description:
        'Forbids optional parameters to include an explicit `undefined` in their type and requires to use `undefined` in optional properties.',
      category: 'Possible Errors',
      recommended: 'error',
    },
    fixable: 'code',
    messages: {
      propertyError:
        'Property is optional, so `undefined` must be included in the type.',
      parameterError:
        'Parameter is optional, so no need to include `undefined` in the type.',
    },
    schema: [],
    type: 'problem',
  },
  defaultOptions: [],
  create: function (context) {
    function containsUndefinedTypeNode(node: TSESTree.TypeNode) {
      return node.type === AST_NODE_TYPES.TSUnionType
        ? node.types.find((n) => n.type === AST_NODE_TYPES.TSUndefinedKeyword)
        : node.type === AST_NODE_TYPES.TSUndefinedKeyword
        ? node
        : undefined;
    }

    function containsAnyTypeNode(node: TSESTree.TypeNode) {
      return node.type === AST_NODE_TYPES.TSUnionType
        ? node.types.find((n) => n.type === AST_NODE_TYPES.TSAnyKeyword)
        : node.type === AST_NODE_TYPES.TSAnyKeyword
        ? node
        : undefined;
    }

    function isFunction(
      node: TSESTree.Node,
    ): node is
      | TSESTree.FunctionDeclaration
      | TSESTree.FunctionExpression
      | TSESTree.ArrowFunctionExpression {
      return (
        node.type === AST_NODE_TYPES.FunctionDeclaration ||
        node.type === AST_NODE_TYPES.FunctionExpression ||
        node.type === AST_NODE_TYPES.ArrowFunctionExpression
      );
    }

    function isOptionalParam(node: TSESTree.Node): boolean {
      switch (node.type) {
        case AST_NODE_TYPES.Identifier:
          return !!(
            node.optional &&
            node.parent &&
            (node.parent.type === AST_NODE_TYPES.TSParameterProperty ||
              (isFunction(node.parent) &&
                node.parent.params.indexOf(node) >= 0))
          );
        case AST_NODE_TYPES.TSUnionType:
        case AST_NODE_TYPES.TSTypeAnnotation:
          return !!node.parent && isOptionalParam(node.parent);
        default:
          return false;
      }
    }

    function checkParameter(node: TSESTree.TSUndefinedKeyword) {
      if (node.parent && isOptionalParam(node.parent)) {
        context.report({
          node,
          messageId: 'parameterError',
          fix: (fixer) => {
            if (node.parent?.type === AST_NODE_TYPES.TSUnionType) {
              const types = node.parent.types;
              const typePos = node.parent.types.indexOf(node);
              const prevType = types[typePos - 1];
              const nextType = types[typePos + 1];

              if (prevType) {
                return fixer.removeRange([prevType.range[1], node.range[1]]);
              }

              if (nextType) {
                return fixer.removeRange([node.range[0], nextType.range[0]]);
              }
            }

            if (node.parent?.type === AST_NODE_TYPES.TSTypeAnnotation) {
              return fixer.removeRange(node.parent.range);
            }

            return [];
          },
        });
      }
    }

    function checkProperty(
      node:
        | TSESTree.TSAbstractClassProperty
        | TSESTree.TSPropertySignature
        | TSESTree.ClassProperty,
    ) {
      if (
        node.optional &&
        node.typeAnnotation &&
        !(
          containsUndefinedTypeNode(node.typeAnnotation.typeAnnotation) ||
          containsAnyTypeNode(node.typeAnnotation.typeAnnotation)
        )
      ) {
        const typeNode = node.typeAnnotation.typeAnnotation;
        context.report({
          node,
          messageId: 'propertyError',
          fix: (fixer) => {
            const lastTypeNode =
              typeNode.type === AST_NODE_TYPES.TSUnionType
                ? typeNode.types[typeNode.types.length - 1]
                : typeNode;

            const needParens =
              lastTypeNode.type === AST_NODE_TYPES.TSFunctionType ||
              lastTypeNode.type === AST_NODE_TYPES.TSConstructorType;
            const fixers = [];
            if (needParens) {
              fixers.push(fixer.insertTextBefore(lastTypeNode, '('));
              fixers.push(fixer.insertTextAfter(lastTypeNode, ')'));
            }
            fixers.push(fixer.insertTextAfter(typeNode, ' | undefined'));
            return fixers;
          },
        });
      }
    }

    return {
      TSAbstractClassProperty: checkProperty,
      TSPropertySignature: checkProperty,
      ClassProperty: checkProperty,
      TSUndefinedKeyword: checkParameter,
    };
  },
});
