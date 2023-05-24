import { AsyncCallResult, getFailure, getSuccess } from "../call-result/call-result";
import asyncFn, { AsyncFnMock } from "@async-fn/jest";

import {
  withThrownFailures,
  withThrownFailuresUnless,
} from "./with-thrown-failures";

type TestCallResult = AsyncCallResult<string>;

describe("with-thrown-failures", () => {
  let toBeDecoratedMock: AsyncFnMock<() => TestCallResult>;
  let actualPromise: TestCallResult;
  let toBeDecorated: (arg1: string, arg2: string) => TestCallResult;

  beforeEach(() => {
    toBeDecoratedMock = asyncFn();
    toBeDecorated = toBeDecoratedMock;
  });

  describe("given a function with general error handling, when called", () => {
    beforeEach(() => {
      const decorated = withThrownFailures(toBeDecorated);

      actualPromise = decorated("some-arg", "some-other-arg");
    });

    it("calls the underlying function", () => {
      expect(toBeDecoratedMock).toHaveBeenCalledWith(
        "some-arg",
        "some-other-arg"
      );
    });

    it("when call resolves as success, resolves as so", async () => {
      await toBeDecoratedMock.resolve(getSuccess("some-success"));

      const actual = await actualPromise;

      expect(actual).toEqual(getSuccess("some-success"));
    });

    it("when call resolves with failed call result with string as cause, throws", () => {
      toBeDecoratedMock.resolve(getFailure("some-error-code", "some-cause"));

      return expect(actualPromise).rejects.toThrow(
        "Error(some-error-code): some-cause"
      );
    });

    it("when call resolves with failed call result containing message for cause of error, throws", () => {
      const someCause = { message: "some-cause" };
      toBeDecoratedMock.resolve(getFailure("some-error-code", someCause));

      return expect(actualPromise).rejects.toThrow(
        "Error(some-error-code): some-cause"
      );
    });

    it("when call resolves with failed call result with error object as cause, throws original error", () => {
      const someError = new Error("some-error");
      toBeDecoratedMock.resolve(getFailure("irrelevant", someError));

      return expect(actualPromise).rejects.toBe(someError);
    });

    it("when call resolves with failed call result not containing message for cause of error, throws", () => {
      const someCause = { some: "value" };
      toBeDecoratedMock.resolve(getFailure("some-error-code", someCause));

      return expect(actualPromise).rejects.toThrow("Error(some-error-code)");
    });

    it("when call rejects, throws original error", async () => {
      const someError = new Error("some-unrelated-error");

      toBeDecoratedMock.reject(someError);

      return expect(actualPromise).rejects.toBe(someError);
    });
  });

  describe("given a function with error handling unless error is specific, when called", () => {
    beforeEach(() => {
      const errorIsSpecific = (error: { code: string }) =>
        error.code === "some-specific-failure";

      const decorated =
        withThrownFailuresUnless(errorIsSpecific)(toBeDecorated);

      actualPromise = decorated("some-arg", "some-other-arg");
    });

    it("calls the underlying function", () => {
      expect(toBeDecoratedMock).toHaveBeenCalledWith(
        "some-arg",
        "some-other-arg"
      );
    });

    it("when call resolves as success, resolves as so", async () => {
      await toBeDecoratedMock.resolve(getSuccess("some-success"));

      const actual = await actualPromise;

      expect(actual).toEqual(getSuccess("some-success"));
    });

    it("when call resolves as unrelated failure, throws", () => {
      toBeDecoratedMock.resolve(
        getFailure("some-unrelated-failure", "some-cause")
      );

      return expect(actualPromise).rejects.toThrow("some-cause");
    });

    it("when call resolves as the specific failure, resolves as failure", async () => {
      await toBeDecoratedMock.resolve(
        getFailure("some-specific-failure", "some-cause")
      );

      const actual = await actualPromise;

      expect(actual).toEqual(getFailure("some-specific-failure", "some-cause"));
    });

    it("when call resolves with failed call result with string as cause, throws", () => {
      toBeDecoratedMock.resolve(getFailure("some-error-code", "some-cause"));

      return expect(actualPromise).rejects.toThrow(
        "Error(some-error-code): some-cause"
      );
    });

    it("when call resolves with failed call result containing message for cause of error, throws", () => {
      const someCause = { message: "some-cause" };
      toBeDecoratedMock.resolve(getFailure("some-error-code", someCause));

      return expect(actualPromise).rejects.toThrow(
        "Error(some-error-code): some-cause"
      );
    });

    it("when call resolves with failed call result with error object as cause, throws original error", () => {
      const someError = new Error("some-error");
      toBeDecoratedMock.resolve(getFailure("irrelevant", someError));

      return expect(actualPromise).rejects.toBe(someError);
    });

    it("when call resolves with failed call result not containing message for cause of error, throws", () => {
      const someCause = { some: "value" };
      toBeDecoratedMock.resolve(getFailure("some-error-code", someCause));

      return expect(actualPromise).rejects.toThrow("Error(some-error-code)");
    });
  });

  describe("given thrown failures unless specific error is thrown, when called", () => {
    beforeEach(() => {
      const decorated = withThrownFailuresUnless(
        (error) => error.message === "some-specific-error"
      )(toBeDecorated);

      actualPromise = decorated("some-arg", "some-other-arg");
    });

    it("when call resolves as success, resolves as so", async () => {
      await toBeDecoratedMock.resolve(getSuccess("some-success"));

      const actual = await actualPromise;

      expect(actual).toEqual(getSuccess("some-success"));
    });

    it("when call rejects as the specific error, resolves as specific failure", async () => {
      const error = new Error("some-specific-error");
      await toBeDecoratedMock.reject(error);

      const actual = await actualPromise;

      expect(actual).toEqual(getFailure("unknown", error));
    });

    it("when call rejects as some unrelated error, throws", async () => {
      toBeDecoratedMock.reject(new Error("some-unrelated-error"));

      return expect(actualPromise).rejects.toThrow("some-unrelated-error");
    });
  });
});
