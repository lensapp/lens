/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { isPromise } from "../is-promise/is-promise";
import logErrorInjectable from "../../log-error.injectable";

export type WithErrorLoggingFor = (
  getErrorMessage: (error: unknown) => string
) => <T extends (...args: any[]) => any>(
  toBeDecorated: T
) => (...args: Parameters<T>) => ReturnType<T>;

const withErrorLoggingInjectable = getInjectable({
  id: "with-error-logging",

  instantiate: (di): WithErrorLoggingFor => {
    const logError = di.inject(logErrorInjectable);

    return (getErrorMessage) =>
      (toBeDecorated) =>
        (...args) => {
          try {
            const returnValue = toBeDecorated(...args);

            if (isPromise(returnValue)) {
              returnValue.catch((e) => {
                const errorMessage = getErrorMessage(e);

                logError(errorMessage, e);
              });
            }

            return returnValue;
          } catch (e) {
            const errorMessage = getErrorMessage(e);

            logError(errorMessage, e);

            throw e;
          }
        };
  },
});

export default withErrorLoggingInjectable;
