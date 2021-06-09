/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { HashSet, ObservableHashSet } from "../hash-set";

describe("ObservableHashSet<T>", () => {
  it("should not throw on creation", () => {
    expect(() => new ObservableHashSet<{ a: number }>([], item => item.a.toString())).not.toThrowError();
  });

  it("should be initializable", () => {
    const res = new ObservableHashSet([
      { a: 1 },
      { a: 2 },
      { a: 3 },
      { a: 4 },
    ], item => item.a.toString());

    expect(res.size).toBe(4);
  });

  it("has should work as expected", () => {
    const res = new ObservableHashSet([
      { a: 1 },
      { a: 2 },
      { a: 3 },
      { a: 4 },
    ], item => item.a.toString());

    expect(res.has({ a: 1 })).toBe(true);
    expect(res.has({ a: 5 })).toBe(false);
  });

  it("forEach should work as expected", () => {
    const res = new ObservableHashSet([
      { a: 1 },
      { a: 2 },
      { a: 3 },
      { a: 4 },
    ], item => item.a.toString());

    let a = 1;

    res.forEach((item) => {
      expect(item.a).toEqual(a++);
    });
  });

  it("delete should work as expected", () => {
    const res = new ObservableHashSet([
      { a: 1 },
      { a: 2 },
      { a: 3 },
      { a: 4 },
    ], item => item.a.toString());

    expect(res.has({ a: 1 })).toBe(true);
    expect(res.delete({ a: 1 })).toBe(true);
    expect(res.has({ a: 1 })).toBe(false);
    
    expect(res.has({ a: 5 })).toBe(false);
    expect(res.delete({ a: 5 })).toBe(false);
    expect(res.has({ a: 5 })).toBe(false);
  });

  it("toggle should work as expected", () => {
    const res = new ObservableHashSet([
      { a: 1 },
      { a: 2 },
      { a: 3 },
      { a: 4 },
    ], item => item.a.toString());

    expect(res.has({ a: 1 })).toBe(true);
    res.toggle({ a: 1 });
    expect(res.has({ a: 1 })).toBe(false);

    expect(res.has({ a: 6 })).toBe(false);
    res.toggle({ a: 6 });
    expect(res.has({ a: 6 })).toBe(true);
  });

  it("add should work as expected", () => {
    const res = new ObservableHashSet([
      { a: 1 },
      { a: 2 },
      { a: 3 },
      { a: 4 },
    ], item => item.a.toString());

    expect(res.has({ a: 6 })).toBe(false);
    res.add({ a: 6 });
    expect(res.has({ a: 6 })).toBe(true);
  });

  it("add should treat the hash to be the same as equality", () => {
    const res = new ObservableHashSet([
      { a: 1, foobar: "hello" },
      { a: 2 },
      { a: 3 },
      { a: 4 },
    ], item => item.a.toString());

    expect(res.has({ a: 1 })).toBe(true);
    res.add({ a: 1, foobar: "goodbye" });
    expect(res.has({ a: 1 })).toBe(true);
  });

  it("clear should work as expected", () => {
    const res = new ObservableHashSet([
      { a: 1 },
      { a: 2 },
      { a: 3 },
      { a: 4 },
    ], item => item.a.toString());

    expect(res.size).toBe(4);
    res.clear();
    expect(res.size).toBe(0);
  });

  it("replace should work as expected", () => {
    const res = new ObservableHashSet([
      { a: 1 },
      { a: 2 },
      { a: 3 },
      { a: 4 },
    ], item => item.a.toString());

    expect(res.size).toBe(4);
    res.replace([{ a: 13 }]);
    expect(res.size).toBe(1);
    expect(res.has({ a: 1 })).toBe(false);
    expect(res.has({ a: 13 })).toBe(true);
  });

  it("toJSON should work as expected", () => {
    const res = new ObservableHashSet([
      { a: 1 },
      { a: 2 },
      { a: 3 },
      { a: 4 },
    ], item => item.a.toString());

    expect(res.toJSON()).toStrictEqual([
      { a: 1 },
      { a: 2 },
      { a: 3 },
      { a: 4 },
    ]);
  });

  it("values should work as expected", () => {
    const res = new ObservableHashSet([
      { a: 1 },
      { a: 2 },
      { a: 3 },
      { a: 4 },
    ], item => item.a.toString());
    const iter = res.values();

    expect(iter.next()).toStrictEqual({ 
      value: { a: 1 },
      done: false,
    });

    expect(iter.next()).toStrictEqual({ 
      value: { a: 2 },
      done: false,
    });

    expect(iter.next()).toStrictEqual({ 
      value: { a: 3 },
      done: false,
    });

    expect(iter.next()).toStrictEqual({ 
      value: { a: 4 },
      done: false,
    });

    expect(iter.next()).toStrictEqual({ 
      value: undefined,
      done: true,
    });
  });

  it("keys should work as expected", () => {
    const res = new ObservableHashSet([
      { a: 1 },
      { a: 2 },
      { a: 3 },
      { a: 4 },
    ], item => item.a.toString());
    const iter = res.keys();

    expect(iter.next()).toStrictEqual({ 
      value: { a: 1 },
      done: false,
    });

    expect(iter.next()).toStrictEqual({ 
      value: { a: 2 },
      done: false,
    });

    expect(iter.next()).toStrictEqual({ 
      value: { a: 3 },
      done: false,
    });

    expect(iter.next()).toStrictEqual({ 
      value: { a: 4 },
      done: false,
    });

    expect(iter.next()).toStrictEqual({ 
      value: undefined,
      done: true,
    });
  });

  it("entries should work as expected", () => {
    const res = new ObservableHashSet([
      { a: 1 },
      { a: 2 },
      { a: 3 },
      { a: 4 },
    ], item => item.a.toString());
    const iter = res.entries();

    expect(iter.next()).toStrictEqual({ 
      value: [{ a: 1 }, { a: 1 }],
      done: false,
    });

    expect(iter.next()).toStrictEqual({ 
      value: [{ a: 2 }, { a: 2 }],
      done: false,
    });

    expect(iter.next()).toStrictEqual({ 
      value: [{ a: 3 }, { a: 3 }],
      done: false,
    });

    expect(iter.next()).toStrictEqual({ 
      value: [{ a: 4 }, { a: 4 }],
      done: false,
    });

    expect(iter.next()).toStrictEqual({ 
      value: undefined,
      done: true,
    });
  });
});

describe("HashSet<T>", () => {
  it("should not throw on creation", () => {
    expect(() => new HashSet<{ a: number }>([], item => item.a.toString())).not.toThrowError();
  });

  it("should be initializable", () => {
    const res = new HashSet([
      { a: 1 },
      { a: 2 },
      { a: 3 },
      { a: 4 },
    ], item => item.a.toString());

    expect(res.size).toBe(4);
  });

  it("has should work as expected", () => {
    const res = new HashSet([
      { a: 1 },
      { a: 2 },
      { a: 3 },
      { a: 4 },
    ], item => item.a.toString());

    expect(res.has({ a: 1 })).toBe(true);
    expect(res.has({ a: 5 })).toBe(false);
  });

  it("forEach should work as expected", () => {
    const res = new HashSet([
      { a: 1 },
      { a: 2 },
      { a: 3 },
      { a: 4 },
    ], item => item.a.toString());

    let a = 1;

    res.forEach((item) => {
      expect(item.a).toEqual(a++);
    });
  });

  it("delete should work as expected", () => {
    const res = new HashSet([
      { a: 1 },
      { a: 2 },
      { a: 3 },
      { a: 4 },
    ], item => item.a.toString());

    expect(res.has({ a: 1 })).toBe(true);
    expect(res.delete({ a: 1 })).toBe(true);
    expect(res.has({ a: 1 })).toBe(false);
    
    expect(res.has({ a: 5 })).toBe(false);
    expect(res.delete({ a: 5 })).toBe(false);
    expect(res.has({ a: 5 })).toBe(false);
  });

  it("toggle should work as expected", () => {
    const res = new HashSet([
      { a: 1 },
      { a: 2 },
      { a: 3 },
      { a: 4 },
    ], item => item.a.toString());

    expect(res.has({ a: 1 })).toBe(true);
    res.toggle({ a: 1 });
    expect(res.has({ a: 1 })).toBe(false);

    expect(res.has({ a: 6 })).toBe(false);
    res.toggle({ a: 6 });
    expect(res.has({ a: 6 })).toBe(true);
  });

  it("add should work as expected", () => {
    const res = new HashSet([
      { a: 1 },
      { a: 2 },
      { a: 3 },
      { a: 4 },
    ], item => item.a.toString());

    expect(res.has({ a: 6 })).toBe(false);
    res.add({ a: 6 });
    expect(res.has({ a: 6 })).toBe(true);
  });

  it("add should treat the hash to be the same as equality", () => {
    const res = new HashSet([
      { a: 1, foobar: "hello" },
      { a: 2 },
      { a: 3 },
      { a: 4 },
    ], item => item.a.toString());

    expect(res.has({ a: 1 })).toBe(true);
    res.add({ a: 1, foobar: "goodbye" });
    expect(res.has({ a: 1 })).toBe(true);
  });

  it("clear should work as expected", () => {
    const res = new HashSet([
      { a: 1 },
      { a: 2 },
      { a: 3 },
      { a: 4 },
    ], item => item.a.toString());

    expect(res.size).toBe(4);
    res.clear();
    expect(res.size).toBe(0);
  });

  it("replace should work as expected", () => {
    const res = new HashSet([
      { a: 1 },
      { a: 2 },
      { a: 3 },
      { a: 4 },
    ], item => item.a.toString());

    expect(res.size).toBe(4);
    res.replace([{ a: 13 }]);
    expect(res.size).toBe(1);
    expect(res.has({ a: 1 })).toBe(false);
    expect(res.has({ a: 13 })).toBe(true);
  });

  it("toJSON should work as expected", () => {
    const res = new HashSet([
      { a: 1 },
      { a: 2 },
      { a: 3 },
      { a: 4 },
    ], item => item.a.toString());

    expect(res.toJSON()).toStrictEqual([
      { a: 1 },
      { a: 2 },
      { a: 3 },
      { a: 4 },
    ]);
  });

  it("values should work as expected", () => {
    const res = new HashSet([
      { a: 1 },
      { a: 2 },
      { a: 3 },
      { a: 4 },
    ], item => item.a.toString());
    const iter = res.values();

    expect(iter.next()).toStrictEqual({ 
      value: { a: 1 },
      done: false,
    });

    expect(iter.next()).toStrictEqual({ 
      value: { a: 2 },
      done: false,
    });

    expect(iter.next()).toStrictEqual({ 
      value: { a: 3 },
      done: false,
    });

    expect(iter.next()).toStrictEqual({ 
      value: { a: 4 },
      done: false,
    });

    expect(iter.next()).toStrictEqual({ 
      value: undefined,
      done: true,
    });
  });

  it("keys should work as expected", () => {
    const res = new HashSet([
      { a: 1 },
      { a: 2 },
      { a: 3 },
      { a: 4 },
    ], item => item.a.toString());
    const iter = res.keys();

    expect(iter.next()).toStrictEqual({ 
      value: { a: 1 },
      done: false,
    });

    expect(iter.next()).toStrictEqual({ 
      value: { a: 2 },
      done: false,
    });

    expect(iter.next()).toStrictEqual({ 
      value: { a: 3 },
      done: false,
    });

    expect(iter.next()).toStrictEqual({ 
      value: { a: 4 },
      done: false,
    });

    expect(iter.next()).toStrictEqual({ 
      value: undefined,
      done: true,
    });
  });

  it("entries should work as expected", () => {
    const res = new HashSet([
      { a: 1 },
      { a: 2 },
      { a: 3 },
      { a: 4 },
    ], item => item.a.toString());
    const iter = res.entries();

    expect(iter.next()).toStrictEqual({ 
      value: [{ a: 1 }, { a: 1 }],
      done: false,
    });

    expect(iter.next()).toStrictEqual({ 
      value: [{ a: 2 }, { a: 2 }],
      done: false,
    });

    expect(iter.next()).toStrictEqual({ 
      value: [{ a: 3 }, { a: 3 }],
      done: false,
    });

    expect(iter.next()).toStrictEqual({ 
      value: [{ a: 4 }, { a: 4 }],
      done: false,
    });

    expect(iter.next()).toStrictEqual({ 
      value: undefined,
      done: true,
    });
  });
});
