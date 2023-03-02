/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
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
          let returnValue: ReturnType<typeof toBeDecorated>;

          try {
            returnValue = toBeDecorated(...args);
          } catch (e) {
            const errorMessage = getErrorMessage(e);

            logError(errorMessage, e);

            throw e;
          }

          if ((returnValue as any) instanceof Promise) {
            return returnValue.catch((e: unknown) => {
              const errorMessage = getErrorMessage(e);

              logError(errorMessage, e);

              throw e;
            });
          }

          return returnValue;
        };
  },
});

export default withErrorLoggingInjectable;
