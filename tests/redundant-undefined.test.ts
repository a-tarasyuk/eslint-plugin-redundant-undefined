import { TSESLint } from '@typescript-eslint/experimental-utils';
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
    },
    {
      code: `
interface I {
    p?: string | any;
}
      `,
    },
    {
      code: `
interface I {
    p?: any;
}
      `,
    },
    {
      code: `
class C {
    private p?: any;
}
      `,
    },
    {
      code: `
class C {
    private p?: string | undefined;
}
      `,
    },
    {
      code: `
class C {
    private p?: undefined;
}
      `,
    },
    {
      code: `
abstract class C {
  abstract p?: any;
}
      `,
    },
    {
      code: `
abstract class C {
  abstract p?: string | undefined;
}
      `,
    },
    {
      code: `
abstract class C {
  abstract p?: undefined;
}
      `,
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
          messageId: 'parameterError',
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
          messageId: 'parameterError',
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
          messageId: 'parameterError',
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
          messageId: 'parameterError',
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
          messageId: 'parameterError',
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
          messageId: 'parameterError',
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
          messageId: 'parameterError',
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
  p?: string;
}
      `,
      errors: [
        {
          messageId: 'propertyError',
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
      errors: [
        {
          messageId: 'propertyError',
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
  p?: number | (() => void);
}
      `,
      errors: [
        {
          messageId: 'propertyError',
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
      errors: [
        {
          messageId: 'propertyError',
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
class C {
  private p?: string;
}
      `,
      errors: [
        {
          messageId: 'propertyError',
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
      errors: [
        {
          messageId: 'propertyError',
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
