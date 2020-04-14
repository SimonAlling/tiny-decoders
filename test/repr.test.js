// @flow strict

import { repr } from "../src";

// Make snapshots easier to read.
// Before: `"\\"string\\""`
// After: `"string"`
// This is like the serializer in jest.snapshots.config.js but for _all_ strings.
expect.addSnapshotSerializer({
  test: (value) => typeof value === "string",
  print: (value) => value,
});

beforeEach(() => {
  repr.sensitive = false;
});

class Point {
  /*::
    x: number;
    y: number;
    */

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

// eslint-disable-next-line no-empty-function
function functionWithSomewhatLongName() {}

test("undefined", () => {
  expect(repr(undefined)).toMatchInlineSnapshot(`undefined`);
});

test("null", () => {
  expect(repr(null)).toMatchInlineSnapshot(`null`);
});

test("boolean", () => {
  expect(repr(true)).toMatchInlineSnapshot(`true`);
  expect(repr(false)).toMatchInlineSnapshot(`false`);
});

test("number", () => {
  expect(repr(0)).toMatchInlineSnapshot(`0`);
  expect(repr(123.456)).toMatchInlineSnapshot(`123.456`);
  expect(repr(NaN)).toMatchInlineSnapshot(`NaN`);
  expect(repr(Infinity)).toMatchInlineSnapshot(`Infinity`);
  expect(repr(-Infinity)).toMatchInlineSnapshot(`-Infinity`);
  expect(repr(Math.PI)).toMatchInlineSnapshot(`3.141592653589793`);
  expect(repr(1e300)).toMatchInlineSnapshot(`1e+300`);
  expect(repr(-123456789.01234567890123456789)).toMatchInlineSnapshot(
    `-123456789.01234567`
  );
  expect(
    repr(-123456789.01234567890123456789, {
      maxLength: 10,
    })
  ).toMatchInlineSnapshot(`-1234…34567`);
});

test("string", () => {
  expect(repr("")).toMatchInlineSnapshot(`""`);
  expect(repr("0")).toMatchInlineSnapshot(`"0"`);
  expect(repr("string")).toMatchInlineSnapshot(`"string"`);
  expect(repr('"quotes"')).toMatchInlineSnapshot(`"\\"quotes\\""`);
  /* eslint-disable no-irregular-whitespace */
  expect(repr(" \t\r\n\u2028\u2029\f\v")).toMatchInlineSnapshot(
    `" \\t\\r\\n  \\f\\u000b"`
  );
  expect(repr("Iñtërnâtiônàlizætiøn☃💩")).toMatchInlineSnapshot(
    `"Iñtërnâtiônàlizætiøn☃💩"`
  );
  expect(
    repr("Iñtërnâtiônàlizætiøn☃💩", { maxLength: 10 })
  ).toMatchInlineSnapshot(`"Iñtë…n☃💩"`);
  expect(
    repr(
      "<section><p>Here’s some <code>HTML</code text in a string.</p><p>It’s probably too long to show it all.</p></section>"
    )
  ).toMatchInlineSnapshot(
    `"<section><p>Here’s some <code>HTML</code text in …s probably too long to show it all.</p></section>"`
  );
});

test("symbol", () => {
  expect(repr(Symbol())).toMatchInlineSnapshot(`Symbol()`);
  expect(repr(Symbol("description"))).toMatchInlineSnapshot(
    `Symbol(description)`
  );
  expect(repr(Symbol('"), "key": "other value"'))).toMatchInlineSnapshot(
    `Symbol("), "key": "other value")`
  );
  expect(repr(Symbol("description"), { maxLength: 10 })).toMatchInlineSnapshot(
    `Symbo…tion)`
  );
});

/* eslint-disable no-empty-function, prefer-arrow-callback, flowtype/require-return-type */
test("function", () => {
  expect(repr(repr)).toMatchInlineSnapshot(`function "repr"`);
  expect(repr(() => {})).toMatchInlineSnapshot(`function ""`);
  expect(repr(function named() {})).toMatchInlineSnapshot(`function "named"`);
  expect(
    repr(functionWithSomewhatLongName, { maxLength: 10 })
  ).toMatchInlineSnapshot(`function "func…Name"`);
  expect(repr(async function* generator() {})).toMatchInlineSnapshot(
    `function "generator"`
  );
  const fn = () => {};
  Object.defineProperty(fn, "name", { value: '"), "key": "other value"' });
  expect(repr(fn)).toMatchInlineSnapshot(
    `function "\\"), \\"key\\": \\"other value\\""`
  );
});
/* eslint-enable no-empty-function, prefer-arrow-callback, flowtype/require-return-type */

test("regex", () => {
  expect(repr(/test/)).toMatchInlineSnapshot(`/test/`);
  expect(repr(/^\d{4}-\d{2}-\d{2}$/gimy)).toMatchInlineSnapshot(
    `/^\\d{4}-\\d{2}-\\d{2}$/gimy`
  );
  expect(
    repr(/^\d{4}-\d{2}-\d{2}$/gimy, {
      maxLength: 10,
    })
  ).toMatchInlineSnapshot(`/^\\d{…/gimy`);
});

test("Date", () => {
  expect(repr(new Date("2018-10-27T16:07:33.978Z"))).toMatchInlineSnapshot(
    `Date`
  );
  expect(repr(new Date("invalid"))).toMatchInlineSnapshot(`Date`);
});

test("Error", () => {
  expect(repr(new Error("error"))).toMatchInlineSnapshot(`Error`);
  expect(repr(new RangeError("out of range"))).toMatchInlineSnapshot(`Error`);

  class CustomError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "CustomError";
    }
  }
  expect(repr(new CustomError("custom"))).toMatchInlineSnapshot(`Error`);

  const error = new Error();
  error.name = '"), "key": "other value"';
  expect(repr(error)).toMatchInlineSnapshot(`Error`);
});

/* eslint-disable no-new-wrappers */
test("primitive wrappers", () => {
  expect(repr(new Boolean(true))).toMatchInlineSnapshot(`Boolean`);
  expect(repr(new Boolean(false))).toMatchInlineSnapshot(`Boolean`);
  expect(repr(new Number(0))).toMatchInlineSnapshot(`Number`);
  expect(repr(new String("string"))).toMatchInlineSnapshot(`String`);
});
/* eslint-enable no-new-wrappers */

test("array", () => {
  expect(repr([])).toMatchInlineSnapshot(`[]`);
  expect(repr([1])).toMatchInlineSnapshot(`[1]`);
  expect(repr([1, 2])).toMatchInlineSnapshot(`[1, 2]`);
  expect(repr([1, 2, 3])).toMatchInlineSnapshot(`[1, 2, 3]`);
  expect(repr([1, 2, 3, 4])).toMatchInlineSnapshot(`[1, 2, 3, 4]`);
  expect(repr([1, 2, 3, 4, 5])).toMatchInlineSnapshot(`[1, 2, 3, 4, 5]`);
  expect(repr([1, 2, 3, 4, 5, 6])).toMatchInlineSnapshot(
    `[1, 2, 3, 4, 5, (1 more)]`
  );
  expect(repr([1, 2, 3, 4, 5, 6, 7])).toMatchInlineSnapshot(
    `[1, 2, 3, 4, 5, (2 more)]`
  );
  expect(
    repr([1, 2, 3, 4, 5, 6, 7], { maxArrayChildren: 3 })
  ).toMatchInlineSnapshot(`[1, 2, 3, (4 more)]`);
  expect(repr([1], { recurse: false })).toMatchInlineSnapshot(`Array(1)`);
  expect(repr([1, 2, 3], { recurse: false })).toMatchInlineSnapshot(`Array(3)`);
  expect(
    repr(
      // eslint-disable-next-line no-sparse-arrays
      [
        undefined,
        ,
        null,
        true,
        NaN,
        "a somewhat long string",
        Symbol("symbol with long description"),
        functionWithSomewhatLongName,
        /a somewhat long regex/gm,
        new Date("2018-10-27T16:07:33.978Z"),
        new RangeError(),
        // eslint-disable-next-line no-new-wrappers
        new String("wrap"),
        [],
        {},
        [1],
        { a: 1 },
        new Point(10, 235.8),
      ],
      { maxArrayChildren: Infinity }
    )
  ).toMatchInlineSnapshot(
    `[undefined, <empty>, null, true, NaN, "a somewha…ng string", Symbol(sym…scription), function "functionW…tLongName", /a somewha…g regex/gm, Date, Error, String, [], {}, Array(1), Object(1), Point(2)]`
  );
  expect(
    repr(["a short string"], { recurseMaxLength: 5 })
  ).toMatchInlineSnapshot(`["a…g"]`);
});

test("object", () => {
  expect(repr({})).toMatchInlineSnapshot(`{}`);
  expect(repr({ a: 1 })).toMatchInlineSnapshot(`{"a": 1}`);
  expect(repr({ a: 1, b: 2 })).toMatchInlineSnapshot(`{"a": 1, "b": 2}`);
  expect(repr({ a: 1, b: 2, c: 3 })).toMatchInlineSnapshot(
    `{"a": 1, "b": 2, "c": 3}`
  );
  expect(repr({ a: 1, b: 2, c: 3, d: 4 })).toMatchInlineSnapshot(
    `{"a": 1, "b": 2, "c": 3, (1 more)}`
  );
  expect(repr({ a: 1, b: 2, c: 3, d: 4, e: 5 })).toMatchInlineSnapshot(
    `{"a": 1, "b": 2, "c": 3, (2 more)}`
  );
  expect(
    repr({ a: 1, b: 2, c: 3, d: 4, e: 5 }, { maxObjectChildren: 1 })
  ).toMatchInlineSnapshot(`{"a": 1, (4 more)}`);
  expect(repr({ a: 1, b: 2, c: 3 }, { recurse: false })).toMatchInlineSnapshot(
    `Object(3)`
  );
  expect(
    repr(
      {
        a: undefined,
        b: null,
        c: true,
        d: NaN,
        e: "a somewhat long string",
        f: Symbol("symbol with long description"),
        g: functionWithSomewhatLongName,
        h: /a somewhat long regex/gm,
        i: new Date("2018-10-27T16:07:33.978Z"),
        j: new RangeError(),
        // eslint-disable-next-line no-new-wrappers
        k: new String("wrap"),
        l: [],
        m: {},
        o: [1],
        p: { a: 1 },
        r: new Point(10, 235.8),
        "a somewhat long key name": 1,
      },
      { maxObjectChildren: Infinity }
    )
  ).toMatchInlineSnapshot(
    `{"a": undefined, "b": null, "c": true, "d": NaN, "e": "a somewha…ng string", "f": Symbol(sym…scription), "g": function "functionW…tLongName", "h": /a somewha…g regex/gm, "i": Date, "j": Error, "k": String, "l": [], "m": {}, "o": Array(1), "p": Object(1), "r": Point(2), "a somewha… key name": 1}`
  );
  expect(
    repr({ "a short key": "a short string" }, { recurseMaxLength: 5 })
  ).toMatchInlineSnapshot(`{"a…y": "a…g"}`);
  expect(repr({ '"), "key": "other value"': 1 })).toMatchInlineSnapshot(
    `{"\\"), \\"ke…r value\\"": 1}`
  );
  expect(repr(new Point(10, 235.8))).toMatchInlineSnapshot(
    `Point {"x": 10, "y": 235.8}`
  );
});

test("misc", () => {
  expect(repr(Buffer.from("buffer"))).toMatchInlineSnapshot(`Uint8Array`);
  expect(repr(new Float32Array([1, 2.5]))).toMatchInlineSnapshot(
    `Float32Array`
  );
  expect(repr(document.querySelectorAll("html"))).toMatchInlineSnapshot(
    `NodeList`
  );
  expect(repr(new Map())).toMatchInlineSnapshot(`Map`);
  expect(repr(new Set([1, 1, 2]))).toMatchInlineSnapshot(`Set`);
  expect(repr(new WeakMap())).toMatchInlineSnapshot(`WeakMap`);
  expect(repr(new WeakSet())).toMatchInlineSnapshot(`WeakSet`);
  expect(repr(document.createElement("p"))).toMatchInlineSnapshot(
    `HTMLParagraphElement`
  );
  expect(
    repr(
      // eslint-disable-next-line no-unused-vars, flowtype/require-return-type
      (function (a: number, b: number) {
        // eslint-disable-next-line prefer-rest-params
        return arguments;
      })(1, 2)
    )
  ).toMatchInlineSnapshot(`Arguments`);
});

test("catch errors", () => {
  const regex = /test/;
  // $FlowIgnore: Re-assigning method for testing.
  regex.toString = () => {
    throw new Error("failed for whatever reason");
  };
  expect(() => regex.toString()).toThrowErrorMatchingInlineSnapshot(
    `failed for whatever reason`
  );
  expect(repr(regex)).toMatchInlineSnapshot(`RegExp`);
});

test("sensitive output", () => {
  repr.sensitive = true;

  expect(repr(undefined)).toMatchInlineSnapshot(`undefined`);
  expect(repr(null)).toMatchInlineSnapshot(`null`);

  expect(repr(0)).toMatchInlineSnapshot(`number`);
  expect(repr(Infinity)).toMatchInlineSnapshot(`number`);
  expect(repr(NaN)).toMatchInlineSnapshot(`number`);

  expect(repr(true)).toMatchInlineSnapshot(`boolean`);
  expect(repr(false)).toMatchInlineSnapshot(`boolean`);

  expect(repr(Symbol())).toMatchInlineSnapshot(`symbol`);
  expect(repr(Symbol("description"))).toMatchInlineSnapshot(`symbol`);

  expect(repr(/.*/)).toMatchInlineSnapshot(`regexp`);

  expect(repr("")).toMatchInlineSnapshot(`string`);
  expect(repr("test")).toMatchInlineSnapshot(`string`);

  expect(repr(repr)).toMatchInlineSnapshot(`function "repr"`);
  /* eslint-disable no-empty-function, prefer-arrow-callback, flowtype/require-return-type */
  expect(repr(() => {})).toMatchInlineSnapshot(`function ""`);
  expect(repr(function named() {})).toMatchInlineSnapshot(`function "named"`);
  /* eslint-enable no-empty-function, prefer-arrow-callback, flowtype/require-return-type */

  expect(repr(new Date("2018-10-27T16:07:33.978Z"))).toMatchInlineSnapshot(
    `Date`
  );
  expect(repr(new Error("error"))).toMatchInlineSnapshot(`Error`);
  /* eslint-disable no-new-wrappers */
  expect(repr(new Boolean(true))).toMatchInlineSnapshot(`Boolean`);
  expect(repr(new Boolean(false))).toMatchInlineSnapshot(`Boolean`);
  expect(repr(new Number(0))).toMatchInlineSnapshot(`Number`);
  expect(repr(new String("string"))).toMatchInlineSnapshot(`String`);
  /* eslint-enable no-new-wrappers */

  expect(repr([])).toMatchInlineSnapshot(`[]`);
  expect(repr([1])).toMatchInlineSnapshot(`[number]`);
  expect(repr([1], { recurse: false })).toMatchInlineSnapshot(`Array(1)`);
  expect(
    repr(
      // eslint-disable-next-line no-sparse-arrays
      [
        undefined,
        ,
        null,
        true,
        NaN,
        "string",
        Symbol("desc"),
        repr,
        /test/gm,
        new Date("2018-10-27T16:07:33.978Z"),
        new RangeError(),
        // eslint-disable-next-line no-new-wrappers
        new String("wrap"),
        [],
        {},
        [1],
        { a: 1 },
        new Point(10, 235.8),
      ],
      { maxArrayChildren: Infinity }
    )
  ).toMatchInlineSnapshot(
    `[undefined, <empty>, null, boolean, number, string, symbol, function "repr", regexp, Date, Error, String, [], {}, Array(1), Object(1), Point(2)]`
  );

  expect(repr({})).toMatchInlineSnapshot(`{}`);
  expect(repr({ a: 1 })).toMatchInlineSnapshot(`{"a": number}`);
  expect(repr({ a: 1 }, { recurse: false })).toMatchInlineSnapshot(`Object(1)`);
  expect(
    repr(
      {
        a: undefined,
        b: null,
        c: true,
        d: NaN,
        e: "string",
        f: Symbol("desc"),
        g: repr,
        h: /test/gm,
        i: new Date("2018-10-27T16:07:33.978Z"),
        j: new RangeError(),
        // eslint-disable-next-line no-new-wrappers
        k: new String("wrap"),
        l: [],
        m: {},
        o: [1],
        p: { a: 1 },
        r: new Point(10, 235.8),
      },
      { maxObjectChildren: Infinity }
    )
  ).toMatchInlineSnapshot(
    `{"a": undefined, "b": null, "c": boolean, "d": number, "e": string, "f": symbol, "g": function "repr", "h": regexp, "i": Date, "j": Error, "k": String, "l": [], "m": {}, "o": Array(1), "p": Object(1), "r": Point(2)}`
  );
  expect(repr(new Point(10, 235.8))).toMatchInlineSnapshot(
    `Point {"x": number, "y": number}`
  );
});
