/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, instantiationDecoratorToken, createInstantiationTargetDecorator } from "@ogre-tools/injectable";
import assert from "assert";
import emitTelemetryInjectable from "./emit-telemetry.injectable";
import telemetryWhiteListForParameterlessFunctionsInjectable from "./telemetry-white-list-for-parameterless-functions.injectable";
import { isFunction } from "@k8slens/utilities";

const basicTelemetryDecoratorInjectable = getInjectable({
  id: "basic-telemetry-decorator",

  instantiate: (diForDecorator) => createInstantiationTargetDecorator({
    decorate: (instantiateToBeDecorated) =>
      (di, instantiationParameter) => {
        const instance = instantiateToBeDecorated(di, instantiationParameter);

        if (isFunction(instance)) {
          return (...args: unknown[]) => {
            const currentContext = di.context.at(-1);

            assert(currentContext);

            const emitTelemetry = diForDecorator.inject(emitTelemetryInjectable);
            const whiteList = diForDecorator.inject(telemetryWhiteListForParameterlessFunctionsInjectable);

            if (whiteList.has(currentContext.injectable.id)) {
              emitTelemetry({
                action: currentContext.injectable.id,
              });
            }

            return instance(...args);
          };
        }

        return instance;
      },
  }),

  decorable: false,
  injectionToken: instantiationDecoratorToken,
});

export default basicTelemetryDecoratorInjectable;
