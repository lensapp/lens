/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { HashSet, ObservableHashSet } from "./hash-set";

describe("ObservableHashSet<T>", () => {
  it("should not throw on creation", () => {
    expect(() => new ObservableHashSet<{ a: number }>([], item => item.a.toString())).not.toThrowError();
  });

  it("should be initialized", () => {
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

  it("should be initialized", () => {
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
