import { TSESLint } from '@typescript-eslint/utils';
import rule from '../src/redundant-undefined';

const ruleTester = new TSESLint.RuleTester({
  parserOptions: {
    warnOnUnsupportedTypeScriptVersion: false,
  },
  parser: require.resolve('@typescript-eslint/parser'),
});

ruleTester.run('redundant-undefined', rule, {
  valid: [
    {
      code: `
function f(p?: string): void {
}
      `,
    },
    {
      code: `
const f = (p?: string) => {}
      `,
    },
    {
      code: `
class C {
  constructor(public p?: string) {}
}
      `,
    },
    {
      code: `
class C {
  m(p?: string) {}
}
      `,
    },
    {
      code: `
interface I {
  p?: string | undefined;
}
      `,
      options: [{ followExactOptionalPropertyTypes: true }],
    },
    {
      code: `
class C {
  private p?: number | undefined;
}
      `,
      options: [{ followExactOptionalPropertyTypes: true }],
    },
    {
      code: `
abstract class C {
  abstract p?: string | undefined;
}
      `,
      options: [{ followExactOptionalPropertyTypes: true }],
    },
  ],
  invalid: [
    {
      code: `
function f(p?: undefined | string): void {
}
      `,
      errors: [
        {
          messageId: 'parameterOptionalError',
          line: 2,
          column: 16,
        },
      ],
      output: `
function f(p?: string): void {
}
      `,
    },
    {
      code: `
const f = (p?: string | undefined) => {}
      `,
      errors: [
        {
          messageId: 'parameterOptionalError',
          line: 2,
          column: 25,
        },
      ],
      output: `
const f = (p?: string) => {}
      `,
    },
    {
      code: `
class C {
  constructor(public p?: string | undefined) {}
}
      `,
      errors: [
        {
          messageId: 'parameterOptionalError',
          line: 3,
          column: 35,
        },
      ],
      output: `
class C {
  constructor(public p?: string) {}
}
      `,
    },
    {
      code: `
class C {
  m(p?: string | undefined) {}
}
      `,
      errors: [
        {
          messageId: 'parameterOptionalError',
          line: 3,
          column: 18,
        },
      ],
      output: `
class C {
  m(p?: string) {}
}
      `,
    },
    {
      code: `
function f(p?: number | undefined | string): void {
}
      `,
      errors: [
        {
          messageId: 'parameterOptionalError',
          line: 2,
          column: 25,
        },
      ],
      output: `
function f(p?: number | string): void {
}
      `,
    },
    {
      code: `
function f(p?: number | string | undefined): void {
}
      `,
      errors: [
        {
          messageId: 'parameterOptionalError',
          line: 2,
          column: 34,
        },
      ],
      output: `
function f(p?: number | string): void {
}
      `,
    },
    {
      code: `
function f(p?: undefined): void {
}
      `,
      errors: [
        {
          messageId: 'parameterOptionalError',
          line: 2,
          column: 16,
        },
      ],
      output: `
function f(p?): void {
}
      `,
    },
    {
      code: `
interface I {
  p?: string | undefined;
}
      `,
      errors: [
        {
          messageId: 'propertyOptionalError',
          line: 3,
          column: 16,
        },
      ],
      output: `
interface I {
  p?: string;
}
      `,
    },
    {
      code: `
class C {
  private p?: string | undefined;
}
      `,
      errors: [
        {
          messageId: 'propertyOptionalError',
          line: 3,
          column: 24,
        },
      ],
      output: `
class C {
  private p?: string;
}
      `,
    },
    {
      code: `
abstract class C {
  abstract p?: string | undefined;
}
      `,
      errors: [
        {
          messageId: 'propertyOptionalError',
          line: 3,
          column: 25,
        },
      ],
      output: `
abstract class C {
  abstract p?: string;
}
      `,
    },
    {
      code: `
interface I {
  p?: string;
}
      `,
      options: [{ followExactOptionalPropertyTypes: true }],
      errors: [
        {
          messageId: 'exactOptionalPropertyTypesError',
          line: 3,
          column: 3,
        },
      ],
      output: `
interface I {
  p?: string | undefined;
}
      `,
    },
    {
      code: `
interface I {
  p?: string | number;
}
      `,
      options: [{ followExactOptionalPropertyTypes: true }],
      errors: [
        {
          messageId: 'exactOptionalPropertyTypesError',
          line: 3,
          column: 3,
        },
      ],
      output: `
interface I {
  p?: string | number | undefined;
}
      `,
    },
    {
      code: `
interface I {
  p?: number | (/* start */() => void/* end */);
}
      `,
      options: [{ followExactOptionalPropertyTypes: true }],
      errors: [
        {
          messageId: 'exactOptionalPropertyTypesError',
          line: 3,
          column: 3,
        },
      ],
      output: `
interface I {
  p?: number | (/* start */() => void/* end */) | undefined;
}
      `,
    },
    {
      code: `
interface I {
  p?: number | (() => void);
}
      `,
      options: [{ followExactOptionalPropertyTypes: true }],
      errors: [
        {
          messageId: 'exactOptionalPropertyTypesError',
          line: 3,
          column: 3,
        },
      ],
      output: `
interface I {
  p?: number | (() => void) | undefined;
}
      `,
    },
    {
      code: `
interface I {
  p?: new () => {};
}
      `,
      options: [{ followExactOptionalPropertyTypes: true }],
      errors: [
        {
          messageId: 'exactOptionalPropertyTypesError',
          line: 3,
          column: 3,
        },
      ],
      output: `
interface I {
  p?: (new () => {}) | undefined;
}
      `,
    },
    {
      code: `
interface I<T> {
  p?: T extends string ? string : number;
}
      `,
      options: [{ followExactOptionalPropertyTypes: true }],
      errors: [
        {
          messageId: 'exactOptionalPropertyTypesError',
          line: 3,
          column: 3,
        },
      ],
      output: `
interface I<T> {
  p?: (T extends string ? string : number) | undefined;
}
      `,
    },
    {
      code: `
class C {
  private p?: string;
}
      `,
      options: [{ followExactOptionalPropertyTypes: true }],
      errors: [
        {
          messageId: 'exactOptionalPropertyTypesError',
          line: 3,
          column: 3,
        },
      ],
      output: `
class C {
  private p?: string | undefined;
}
      `,
    },
    {
      code: `
abstract class C {
  abstract p?: string;
}
      `,
      options: [{ followExactOptionalPropertyTypes: true }],
      errors: [
        {
          messageId: 'exactOptionalPropertyTypesError',
          line: 3,
          column: 3,
        },
      ],
      output: `
abstract class C {
  abstract p?: string | undefined;
}
      `,
    },
  ],
});
