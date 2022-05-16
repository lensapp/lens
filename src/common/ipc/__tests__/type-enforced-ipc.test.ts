/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { EventEmitter } from "events";
import { onCorrect, onceCorrect } from "../type-enforced-ipc";

describe("type enforced ipc tests", () => {
  describe("onCorrect tests", () => {
    it("should call the handler if the args are valid", () => {
      let called = false;
      const source = new EventEmitter();
      const listener = () => called = true;
      const verifier = (args: unknown[]): args is [] => true;
      const channel = "foobar";

      onCorrect({ source, listener, verifier, channel });

      source.emit(channel);
      expect(called).toBe(true);
    });

    it("should not call the handler if the args are not valid", () => {
      let called = false;
      const source = new EventEmitter();
      const listener = () => called = true;
      const verifier = (args: unknown[]): args is [] => false;
      const channel = "foobar";

      onCorrect({ source, listener, verifier, channel });

      source.emit(channel);
      expect(called).toBe(false);
    });

    it("should call the handler twice if the args are valid on two emits", () => {
      let called = 0;
      const source = new EventEmitter();
      const listener = () => called += 1;
      const verifier = (args: unknown[]): args is [] => true;
      const channel = "foobar";

      onCorrect({ source, listener, verifier, channel });

      source.emit(channel);
      source.emit(channel);
      expect(called).toBe(2);
    });

    it("should call the handler twice if the args are [valid, invalid, valid]", () => {
      let called = 0;
      const source = new EventEmitter();
      const listener = () => called += 1;
      const results = [true, false, true];
      const verifier = (args: unknown[]): args is [] => results.pop() ?? false;
      const channel = "foobar";

      onCorrect({ source, listener, verifier, channel });

      source.emit(channel);
      source.emit(channel);
      source.emit(channel);
      expect(called).toBe(2);
    });
  });

  describe("onceCorrect tests", () => {
    it("should call the handler if the args are valid", () => {
      let called = false;
      const source = new EventEmitter();
      const listener = () => called = true;
      const verifier = (args: unknown[]): args is [] => true;
      const channel = "foobar";

      onceCorrect({ source, listener, verifier, channel });

      source.emit(channel);
      expect(called).toBe(true);
    });

    it("should not call the handler if the args are not valid", () => {
      let called = false;
      const source = new EventEmitter();
      const listener = () => called = true;
      const verifier = (args: unknown[]): args is [] => false;
      const channel = "foobar";

      onceCorrect({ source, listener, verifier, channel });

      source.emit(channel);
      expect(called).toBe(false);
    });

    it("should call the handler only once even if args are valid multiple times", () => {
      let called = 0;
      const source = new EventEmitter();
      const listener = () => called += 1;
      const verifier = (args: unknown[]): args is [] => true;
      const channel = "foobar";

      onceCorrect({ source, listener, verifier, channel });

      source.emit(channel);
      source.emit(channel);
      expect(called).toBe(1);
    });

    it("should call the handler on only the first valid set of args", () => {
      let called = "";
      let verifierCalled = 0;
      const source = new EventEmitter();
      const listener = (info: any, arg: string) => called = arg;
      const verifier = (args: unknown[]): args is [string] => (++verifierCalled) % 3 === 0;
      const channel = "foobar";

      onceCorrect({ source, listener, verifier, channel });

      source.emit(channel, {}, "a");
      source.emit(channel, {}, "b");
      source.emit(channel, {}, "c");
      source.emit(channel, {}, "d");
      source.emit(channel, {}, "e");
      source.emit(channel, {}, "f");
      source.emit(channel, {}, "g");
      source.emit(channel, {}, "h");
      source.emit(channel, {}, "i");
      expect(called).toBe("c");
    });
  });
});
