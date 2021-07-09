import {
  AST_NODE_TYPES,
  ESLintUtils,
  TSESTree,
  TSESLint,
} from '@typescript-eslint/experimental-utils';

const createRule = ESLintUtils.RuleCreator(() => '');

type Options = [
  {
    followExactOptionalPropertyTypes?: boolean;
  },
];

type MessageIds =
  | 'exactOptionalPropertyTypesError'
  | 'propertyOptionalError'
  | 'parameterOptionalError';

export default createRule<Options, MessageIds>({
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
      exactOptionalPropertyTypesError:
        'Property is optional, so `undefined` must be included in the type.',
      propertyOptionalError:
        'Property is optional, so no need to include `undefined` in the type.',
      parameterOptionalError:
        'Parameter is optional, so no need to include `undefined` in the type.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          followExactOptionalPropertyTypes: { type: 'boolean' },
        },
      },
    ],
    type: 'problem',
  },
  defaultOptions: [
    {
      followExactOptionalPropertyTypes: false,
    },
  ],
  create: function (context, [{ followExactOptionalPropertyTypes }]) {
    function containsTypeNode(
      node: TSESTree.TypeNode,
      kind: AST_NODE_TYPES.TSUndefinedKeyword | AST_NODE_TYPES.TSAnyKeyword,
    ) {
      return node.type === AST_NODE_TYPES.TSUnionType
        ? node.types.find((n) => n.type === kind)
        : node.type === AST_NODE_TYPES.TSUndefinedKeyword
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
        case AST_NODE_TYPES.TSUndefinedKeyword:
        case AST_NODE_TYPES.TSTypeAnnotation:
        case AST_NODE_TYPES.TSUnionType:
          return !!node.parent && isOptionalParam(node.parent);
        default:
          return false;
      }
    }

    function isOptionalProperty(node: TSESTree.Node): boolean {
      switch (node.type) {
        case AST_NODE_TYPES.TSAbstractClassProperty:
        case AST_NODE_TYPES.TSPropertySignature:
        case AST_NODE_TYPES.ClassProperty:
          return !!node.optional;
        case AST_NODE_TYPES.TSUndefinedKeyword:
        case AST_NODE_TYPES.TSTypeAnnotation:
        case AST_NODE_TYPES.TSUnionType:
          return !!node.parent && isOptionalProperty(node.parent);
        default:
          return false;
      }
    }

    function removeUndefinedFixer(
      fixer: TSESLint.RuleFixer,
      node: TSESTree.TSUndefinedKeyword,
    ): TSESLint.RuleFix | null {
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

      return null;
    }

    function checkUndefined(node: TSESTree.TSUndefinedKeyword) {
      if (isOptionalParam(node)) {
        context.report({
          node,
          messageId: 'parameterOptionalError',
          fix: (fixer) => removeUndefinedFixer(fixer, node),
        });
      }

      if (!followExactOptionalPropertyTypes && isOptionalProperty(node)) {
        context.report({
          node,
          messageId: 'propertyOptionalError',
          fix: (fixer) => removeUndefinedFixer(fixer, node),
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
        followExactOptionalPropertyTypes &&
        node.optional &&
        node.typeAnnotation &&
        !(
          containsTypeNode(
            node.typeAnnotation.typeAnnotation,
            AST_NODE_TYPES.TSUndefinedKeyword,
          ) ||
          containsTypeNode(
            node.typeAnnotation.typeAnnotation,
            AST_NODE_TYPES.TSAnyKeyword,
          )
        )
      ) {
        const typeNode = node.typeAnnotation.typeAnnotation;
        context.report({
          node,
          messageId: 'exactOptionalPropertyTypesError',
          fix: (fixer) => {
            const lastTypeNode =
              typeNode.type === AST_NODE_TYPES.TSUnionType
                ? typeNode.types[typeNode.types.length - 1]
                : typeNode;

            const needParens =
              lastTypeNode.type === AST_NODE_TYPES.TSFunctionType ||
              lastTypeNode.type === AST_NODE_TYPES.TSConstructorType ||
              lastTypeNode.type === AST_NODE_TYPES.TSConditionalType;
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
      TSUndefinedKeyword: checkUndefined,
    };
  },
});
