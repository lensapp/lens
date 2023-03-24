import { getFailure, getSuccess } from "../call-result/call-result";
import { pipeline } from "@ogre-tools/fp";

export const withNoThrownErrors =
  <TValue, TArgs extends unknown[]>(
    toBeDecorated: (...args: TArgs) => TValue
  ) =>
  (...args: TArgs) => {
    try {
      return pipeline(
        toBeDecorated(...args),
        getSuccess,
      );
    } catch (error) {
      return getFailure(error);
    }
  };
