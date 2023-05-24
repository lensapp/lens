import { isString } from "lodash/fp";

export type CallFailure = {
  callWasSuccessful: false;
  error: { code: string; message: string; cause: unknown };
};

export type CallSuccess<Response> = Response extends void
  ? { callWasSuccessful: true; response?: undefined }
  : { callWasSuccessful: true; response: Response };

export type CallResult<Response> = CallSuccess<Response> | CallFailure;

export type AsyncCallResult<Response> = Promise<CallResult<Response>>;

export type AsyncCallSuccess<Response> = Promise<CallSuccess<Response>>;

export const getSuccess = <T>(response: T) => ({
  callWasSuccessful: true as const,
  response,
});

const getErrorMessage = (cause: unknown) => {
  if (isString(cause)) {
    return cause;
  }

  const causeObject = cause as any;

  if (causeObject.message) {
    return causeObject.message;
  }

  return undefined;
};

export const getFailure = (errorCode: string, errorCause: unknown) => ({
  callWasSuccessful: false as const,
  error: {
    code: errorCode,
    cause: errorCause,
    message: getErrorMessage(errorCause),
  },
});

export const callWasSuccessful = <Result>(
  callResult: CallResult<Result>
): callResult is CallSuccess<Result> => callResult.callWasSuccessful;

export const callWasFailure = <Result>(
  callResult: CallResult<Result>
): callResult is CallFailure => !callResult.callWasSuccessful;
