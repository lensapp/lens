/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainerForInjection } from "@ogre-tools/injectable";

import {
  getInjectable,
  instantiationDecoratorToken,
  lifecycleEnum,
} from "@ogre-tools/injectable";

import assert from "assert";
import { isFunction } from "lodash/fp";
import emitTelemetryInjectable from "./emit-telemetry.injectable";

import type { WhiteListItem } from "./telemetry-white-list-for-functions.injectable";
import telemetryWhiteListForFunctionsInjectable from "./telemetry-white-list-for-functions.injectable";
import logErrorInjectable from "../../../common/log-error.injectable";

const telemetryDecoratorInjectable = getInjectable({
  id: "telemetry-decorator",

  instantiate: (diForDecorator) => ({
    decorate:
      (instantiateToBeDecorated: any) =>
        (di: DiContainerForInjection, instantiationParameter: any) => {
          const instance = instantiateToBeDecorated(di, instantiationParameter);

          if (isFunction(instance)) {
            return (...args: any[]) => {
              const currentContext = di.context.at(-1);

              assert(currentContext);

              const emitTelemetry = diForDecorator.inject(
                emitTelemetryInjectable,
              );

              const logError = diForDecorator.inject(logErrorInjectable);

              const whiteList = diForDecorator.inject(
                telemetryWhiteListForFunctionsInjectable,
              );

              const whiteListMap = getWhiteListMap(whiteList);

              const whiteListed = whiteListMap.get(currentContext.injectable.id);

              if (whiteListed) {
                let params;

                try {
                  params = whiteListed.getParams(...args);
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
  // Todo: this is required because of imperfect typing in injectable.
  lifecycle: lifecycleEnum.singleton,
  injectionToken: instantiationDecoratorToken,
});

const getWhiteListMap = (whiteList: WhiteListItem[]) =>
  new Map(
    whiteList.map((item) =>
      typeof item === "string"
        ? [
          item,
          {
            getParams: () => undefined,
          },
        ]
        : [
          item.id,
          {
            getParams: item.getParams,
          },
        ],
    ),
  );

export default telemetryDecoratorInjectable;
