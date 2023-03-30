/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { injectionDecoratorToken, getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import emitTelemetryInjectable from "./emit-telemetry.injectable";
import type { WhiteListItem } from "./telemetry-white-list-for-functions.injectable";
import telemetryWhiteListForFunctionsInjectable from "./telemetry-white-list-for-functions.injectable";
import logErrorInjectable from "../../../common/log-error.injectable";
import { isFunction, isString } from "@k8slens/utilities";

const telemetryDecoratorInjectable = getInjectable({
  id: "telemetry-decorator",

  instantiate: (diForDecorator) => ({
    decorate: (instantiateToBeDecorated) =>
      (di, instantiationParameter) => {
        const instance = instantiateToBeDecorated(di, instantiationParameter);

        if (isFunction(instance)) {
          return (...args: unknown[]) => {
            const currentContext = di.context.at(-1);

            assert(currentContext);

            const emitTelemetry = diForDecorator.inject(emitTelemetryInjectable);
            const logError = diForDecorator.inject(logErrorInjectable);
            const whiteList = diForDecorator.inject(telemetryWhiteListForFunctionsInjectable);

            const { isWhiteListed, getParams } = findWhiteListEntry(whiteList, currentContext.injectable.id);

            if (isWhiteListed) {
              let params;

              try {
                params = getParams(...args);
              } catch (e) {
                params = {
                  error:
                    "Tried to produce params for telemetry, but getParams() threw an error",
                };

                logError(
                  `Tried to produce params for telemetry of "${currentContext.injectable.id}", but getParams() threw an error`,
                  e,
                );
              }

              emitTelemetry({
                action: currentContext.injectable.id,
                params,
              });
            }

            return instance(...args);
          };
        }

        return instance;
      },
  }),

  decorable: false,
  injectionToken: injectionDecoratorToken,
});

type WhiteListEntry = {
  isWhiteListed: true;
  getParams: (...args: unknown[]) => Record<string, any> | undefined;
} | {
  isWhiteListed: false;
  getParams?: undefined;
};


const findWhiteListEntry = (whiteList: WhiteListItem[], id: string): WhiteListEntry => {
  for (const entry of whiteList) {
    if (isString(entry)) {
      if (entry === id) {
        return {
          isWhiteListed: true,
          getParams: () => undefined,
        };
      }
    } else {
      if (entry.id === id) {
        return {
          isWhiteListed: true,
          getParams: entry.getParams,
        };
      }
    }
  }

  return {
    isWhiteListed: false,
  };
};

export default telemetryDecoratorInjectable;
