/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import loggerInjectable from "../../logger.injectable";
import { isPromise } from "../is-promise/is-promise";

export type WithErrorLoggingFor = (
  getErrorMessage: (error: unknown) => string
) => <T extends (...args: any[]) => any>(
  toBeDecorated: T
) => (...args: Parameters<T>) => ReturnType<T>;

const withErrorLoggingInjectable = getInjectable({
  id: "with-error-logging",

  instantiate: (di): WithErrorLoggingFor => {
    const logger = di.inject(loggerInjectable);

    return (getErrorMessage) =>
      (toBeDecorated) =>
        (...args) => {
          try {
            const returnValue = toBeDecorated(...args);

            if (isPromise(returnValue)) {
              returnValue.catch((e) => {
                const errorMessage = getErrorMessage(e);

                logger.error(errorMessage, e);
              });
            }

            return returnValue;
          } catch (e) {
            const errorMessage = getErrorMessage(e);

            logger.error(errorMessage, e);

            throw e;
          }
        };
  },
});

export default withErrorLoggingInjectable;
