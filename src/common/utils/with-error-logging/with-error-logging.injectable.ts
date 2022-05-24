/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import loggerInjectable from "../../logger.injectable";

export type WithErrorLoggingFor = (
  getErrorMessage: (error: Error) => string
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
              returnValue.catch((e: Error) => {
                logger.error(getErrorMessage(e as Error), e);
              });
            }

            return returnValue;
          } catch (e) {
            logger.error(getErrorMessage(e as Error), e);
            throw e;
          }
        };
  },
});

export default withErrorLoggingInjectable;

function isPromise(reference: any): reference is Promise<any> {
  return !!reference?.then;
}
