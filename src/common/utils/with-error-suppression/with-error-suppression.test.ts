/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import { getPromiseStatus } from "../../test-utils/get-promise-status";
import { withErrorSuppression } from "./with-error-suppression";

describe("with-error-suppression", () => {
  describe("given decorated sync function", () => {
    let toBeDecorated: jest.Mock<void, [string, string]>;
    let decorated: (a: string, b: string) => void;

    beforeEach(() => {
      toBeDecorated = jest.fn();

      decorated = withErrorSuppression(toBeDecorated);
    });

    describe("when function does not throw", () => {
      let returnValue: void;

      beforeEach(() => {
        returnValue = decorated("some-parameter", "some-other-parameter");
      });

      it("passes arguments to decorated function", () => {
        expect(toBeDecorated).toHaveBeenCalledWith("some-parameter", "some-other-parameter");
      });

      it("returns nothing", () => {
        expect(returnValue).toBeUndefined();
      });
    });

    describe("when function throws", () => {
      let returnValue: void;

      beforeEach(() => {
        // eslint-disable-next-line unused-imports/no-unused-vars-ts
        toBeDecorated.mockImplementation((_, __) => {
          throw new Error("some-error");
        });

        returnValue = decorated("some-parameter", "some-other-parameter");
      });

      it("passes arguments to decorated function", () => {
        expect(toBeDecorated).toHaveBeenCalledWith("some-parameter", "some-other-parameter");
      });

      it("returns nothing", () => {
        expect(returnValue).toBeUndefined();
      });
    });
  });

  describe("given decorated async function", () => {
    let decorated: (a: string, b: string) => Promise<void>;
    let toBeDecorated: AsyncFnMock<typeof decorated>;

    beforeEach(() => {
      toBeDecorated = asyncFn();

      decorated = withErrorSuppression(toBeDecorated);
    });

    describe("when called", () => {
      let returnValuePromise: Promise<void>;

      beforeEach(() => {
        returnValuePromise = decorated("some-parameter", "some-other-parameter");
      });

      it("passes arguments to decorated function", () => {
        expect(toBeDecorated).toHaveBeenCalledWith("some-parameter", "some-other-parameter");
      });

      it("does not resolve yet", async () => {
        const promiseStatus = await getPromiseStatus(returnValuePromise);

        expect(promiseStatus.fulfilled).toBe(false);
      });

      it("when call rejects, resolves with nothing", async () => {
        await toBeDecorated.reject(new Error("some-error"));

        const returnValue = await returnValuePromise;

        expect(returnValue).toBeUndefined();
      });

      it("when call resolves, resolves with nothing", async () => {
        await toBeDecorated.resolve(undefined);

        const returnValue = await returnValuePromise;

        expect(returnValue).toBeUndefined();
      });
    });
  });
});
