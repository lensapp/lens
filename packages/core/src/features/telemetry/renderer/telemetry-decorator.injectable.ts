/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type {
  DiContainerForInjection,
  Injectable,
} from "@ogre-tools/injectable";

import {
  lifecycleEnum,
  getInjectable,
  instantiationDecoratorToken,
} from "@ogre-tools/injectable";
import assert from "assert";

import { isFunction } from "lodash/fp";
import emitTelemetryInjectable from "./emit-telemetry.injectable";
import telemetryWhiteListForFunctionsInjectable from "./telemetry-white-list-for-functions.injectable";

const telemetryDecoratorInjectable = getInjectable({
  id: "telemetry-decorator",

  instantiate: (diForDecorator) => {
    const emitTelemetry = diForDecorator.inject(emitTelemetryInjectable);

    const whiteList = diForDecorator.inject(
      telemetryWhiteListForFunctionsInjectable,
    );

    const shouldEmitTelemetry = shouldEmitTelemetryFor(whiteList);

    return {
      decorate:
        (instantiateToBeDecorated: any) =>
          (di: DiContainerForInjection, instantiationParameter: any) => {
            const instance = instantiateToBeDecorated(di, instantiationParameter);

            if (isFunction(instance)) {
              return (...args: any[]) => {
                const currentContext = di.context.at(-1);

                assert(currentContext);

                if (shouldEmitTelemetry(currentContext.injectable)) {
                  emitTelemetry({ action: currentContext.injectable.id, args });
                }

                return instance(...args);
              };
            }

            return instance;
          },
    };
  },

  decorable: false,
  // Todo: this is required because of imperfect typing in injectable.
  lifecycle: lifecycleEnum.singleton,
  injectionToken: instantiationDecoratorToken,
});

const shouldEmitTelemetryFor =
  (whiteList: string[]) => (injectable: Injectable<any, any, any>) =>
    injectable.tags?.includes("emit-telemetry") ||
    whiteList.includes(injectable.id);

export default telemetryDecoratorInjectable;
