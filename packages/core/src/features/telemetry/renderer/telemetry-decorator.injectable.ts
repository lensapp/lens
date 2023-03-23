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
import emitTelemetryInjectable, {
  EmitTelemetry,
} from "./emit-telemetry.injectable";

import type { WhiteListItem } from "./telemetry-white-list-for-functions.injectable";
import telemetryWhiteListForFunctionsInjectable from "./telemetry-white-list-for-functions.injectable";

import logErrorInjectable, {
  LogError,
} from "../../../common/log-error.injectable";

import type { AppEvent } from "../../../common/app-event-bus/event-bus";

const telemetryDecoratorInjectable = getInjectable({
  id: "telemetry-decorator",

  instantiate: (diForDecorator) => ({
    decorate:
      (instantiateToBeDecorated: any) =>
      (di: DiContainerForInjection, instantiationParameter: any) => {
        const instance = instantiateToBeDecorated(di, instantiationParameter);

        if (!isFunction(instance)) {
          return instance;
        }

        return (...args: any[]) => {
          const currentContext = di.context.at(-1);

          assert(currentContext);

          const emitTelemetry = diForDecorator.inject(emitTelemetryInjectable);
          const logError = diForDecorator.inject(logErrorInjectable);
          const doTelemetry = doTelemetryFor({ logError, emitTelemetry });

          const whiteList = diForDecorator.inject(
            telemetryWhiteListForFunctionsInjectable
          );

          const whiteListMap = getWhiteListMap(whiteList);

          const whiteListed = whiteListMap.get(currentContext.injectable.id);

          const result = instance(...args);

          if (whiteListed) {
            doTelemetry(whiteListed, args, currentContext);
          }

          return result;
        };
      },
  }),

  decorable: false,
  // Todo: this is required because of imperfect typing in injectable.
  lifecycle: lifecycleEnum.singleton,
  injectionToken: instantiationDecoratorToken,
});

const doTelemetryFor =
  ({
    logError,
    emitTelemetry,
  }: {
    logError: LogError;
    emitTelemetry: EmitTelemetry;
  }) =>
  (
    whiteListed: { getParams: (...args: unknown[]) => AppEvent["params"] },
    args: any[],
    currentContext: any
  ) => {
    try {
      const params = whiteListed.getParams(...args);

      emitTelemetry({
        action: currentContext.injectable.id,
        params,
      });
    } catch (e: any) {
      logError(
        `Tried to produce params for telemetry of "${currentContext.injectable.id}", but getParams() threw an error`,
        e
      );

      emitTelemetry({
        action: currentContext.injectable.id,

        params: {
          error:
            "Tried to produce params for telemetry, but getParams() threw an error",
        },
      });
    }
  };

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
          ]
    )
  );

export default telemetryDecoratorInjectable;
