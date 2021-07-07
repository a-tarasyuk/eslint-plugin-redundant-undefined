# eslint-plugin-redundant-undefined

> Forbids optional parameters to include an explicit `undefined` in their type and requires to use `undefined` in optional properties.

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/a-tarasyuk/eslint-plugin-redundant-undefined/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/eslint-plugin-redundant-undefined.svg?style=flat-square)](https://www.npmjs.com/package/eslint-plugin-redundant-undefined) [![GitHub Workflow Status](https://img.shields.io/github/workflow/status/a-tarasyuk/eslint-plugin-redundant-undefined/main?style=flat-square)](https://github.com/a-tarasyuk/eslint-plugin-redundant-undefined/actions) [![Coverage Status](https://img.shields.io/coveralls/github/a-tarasyuk/eslint-plugin-redundant-undefined?style=flat-square)](https://coveralls.io/github/a-tarasyuk/eslint-plugin-redundant-undefined?branch=main)

## Installation

```
$ npm i eslint-plugin-redundant-undefined @typescript-eslint/parser --save-dev
```

## Usage

Add `redundant-undefined` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
  "parser": "@typescript-eslint/parser",
  "plugins": ["redundant-undefined"]
}
```

Then configure the rules you want to use under the rules section.

```json
{
  "rules": {
    "redundant-undefined/redundant-undefined": "error"
  }
}
```

## Rule Details

- Avoid explicitly specifying `undefined` as a type for a parameter which is already optional
- Require explicitly specifying `undefined` as a type for a parameter which is already optional &mdash; this provides the correct semantics for people who have `exactOptionalPropertyType: true`

### Examples

Examples of **incorrect** code:

```ts
function f(s?: undefined | string): void {}

function f(s?: number | undefined | string): void {}

interface I {
  a?: string;
}

interface I {
  a?: string | number;
}
```

Examples of **correct** code:

```ts
function f(s?: string): void {}

interface I {
  a?: string | undefined;
}

interface I {
  a?: any;
}
```

## License and Copyright

This software is released under the terms of the [MIT license](https://github.com/a-tarasyuk/redundant-undefined/blob/master/LICENSE.md).
