import {
  CallResult,
  callWasFailure,
  callWasSuccessful,
  getFailure,
  getSuccess,
} from "./call-result";

describe("call-result", () => {
  it("given successful call, narrows type of response", () => {
    const someSuccess: CallResult<string> = getSuccess("some-success");

    if (callWasSuccessful(someSuccess)) {
      expect(someSuccess.response).toBe("some-success");
    }

    expect.assertions(1);
  });

  it("given successful call, call is not failure", () => {
    const actual = callWasFailure(getSuccess("some-success"));

    expect(actual).toBe(false);
  });

  it("given unsuccessful call, narrows type of error", () => {
    const someFailure: CallResult<string> = getFailure(
      "some-cause",
    );

    // Todo: find out why this this type narrowing isn't working anymore.
    if (callWasFailure(someFailure)) {
      expect(someFailure.error).toEqual({
        cause: "some-cause",
        message: "some-cause",
      });
    }

    expect.assertions(1);
  });

  it("given unsuccessful call, call is not successful", () => {
    const actual = callWasSuccessful(
      getFailure("some-cause")
    );

    expect(actual).toBe(false);
  });

  it('when a call fails by throwing a thing with no known message, fails with no message', () => {
    const failure = getFailure({ noKnownMessage: 'irrelevant' });

    expect(failure.error.message).toBeUndefined();
  });
});
