import { AssertionError } from "assert";

export function NotFalsy<T>(input: T | undefined | null | false | "" | 0): input is T {
  return Boolean(input);
}

export function SecondNotFalsy<T, V>(input: readonly [T, V | undefined | null | false | "" | 0]): input is [T, V] {
  return Boolean(input[1]);
}

export function assert<T>(input: T | undefined | null | false | "" | 0, message?: string): T {
  if (!NotFalsy(input)) {
    throw new AssertionError({
      actual: input,
      message: message ?? "input should pass checker",
    });
  }

  return input;
}
