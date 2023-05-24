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
      "some-error-code",
      "some-cause"
    );

    if (callWasFailure(someFailure)) {
      expect(someFailure.error).toEqual({
        code: "some-error-code",
        cause: "some-cause",
        message: "some-cause",
      });
    }

    expect.assertions(1);
  });

  it("given unsuccessful call, call is not successful", () => {
    const actual = callWasSuccessful(
      getFailure("some-error-code", "some-cause")
    );

    expect(actual).toBe(false);
  });
});
