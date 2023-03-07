/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import { getDiForUnitTesting } from "../../../main/getDiForUnitTesting";
import withOrphanPromiseInjectable from "./with-orphan-promise.injectable";
import logErrorInjectable from "../../log-error.injectable";

describe("with orphan promise, when called", () => {
  let toBeDecorated: AsyncFnMock<(arg1: string, arg2: string) => Promise<string>>;
  let actual: void;
  let logErrorMock: jest.Mock;

  beforeEach(() => {
    const di = getDiForUnitTesting();

    logErrorMock = jest.fn();

    di.override(logErrorInjectable, () => logErrorMock);

    const withOrphanPromise = di.inject(withOrphanPromiseInjectable);

    toBeDecorated = asyncFn();

    const decorated = withOrphanPromise(toBeDecorated);

    actual = decorated("some-argument", "some-other-argument");
  });

  it("calls decorated with arguments", () => {
    expect(toBeDecorated).toHaveBeenCalledWith("some-argument", "some-other-argument");
  });

  it("given promise returned by decorated has not been fulfilled yet, already returns nothing", () => {
    expect(actual).toBeUndefined();
  });

  it("when decorated function resolves, nothing happens", async () => {
    await toBeDecorated.resolve("irrelevant");
    // Note: there is no expect, test is here only for documentation.
  });

  describe("when decorated function rejects", () => {
    beforeEach(async () => {
      await toBeDecorated.reject("some-error");
    });

    it("logs the rejection", () => {
      expect(logErrorMock).toHaveBeenCalledWith("Orphan promise rejection encountered", "some-error");
    });

    it("nothing else happens", () => {
      // Note: there is no expect, test is here only for documentation.
    });
  });
});
