import {
  AsyncCallResult,
  CallFailure,
  CallResult,
  callWasFailure,
  getFailure,
} from "../call-result/call-result";

type ToBeDecorated<T, T2 extends unknown[]> = (
  ...args: T2
) => AsyncCallResult<T>;

export const withThrownFailures =
  <T, T2 extends unknown[]>(toBeDecorated: ToBeDecorated<T, T2>) =>
  async (...args: T2) => {
    const result = await toBeDecorated(...args);

    if (callWasFailure(result)) {
      throw getError(result);
    }

    return result;
  };

export const withThrownFailuresUnless =
  (...reasonsToNotThrow: ErrorShouldNotThrow[]) =>
  <TValue, TArgs extends unknown[]>(
    toBeDecorated: ToBeDecorated<TValue, TArgs>
  ) =>
  async (...args: TArgs) => {
    let result: CallResult<TValue>;

    try {
      result = await toBeDecorated(...args);
    } catch (error) {
      const reasonsForNotThrowing = reasonsToNotThrow.filter((reason) =>
        reason(error)
      );

      if (reasonsForNotThrowing.length) {
        return getFailure("unknown", error);
      }

      throw error;
    }

    const notThrownCall = result;

    if (callWasFailure(notThrownCall)) {
      const reasonsForNotThrowing = reasonsToNotThrow.filter((reason) =>
        reason(notThrownCall.error)
      );

      if (reasonsForNotThrowing.length) {
        return notThrownCall;
      }

      throw getError(notThrownCall);
    }

    return notThrownCall;
  };

type ErrorShouldNotThrow = (error: any) => boolean;

const getError = (call: CallFailure) => {
  if (call.error.cause instanceof Error) {
    return call.error.cause;
  }

  if (call.error.message) {
    return new Error(`Error(${call.error.code}): ${call.error.message}`);
  }

  return new Error(`Error(${call.error.code})`);
};
