/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { computed, runInAction } from "mobx";
import type { DiContainer } from "@ogre-tools/injectable";
import { getInjectable } from "@ogre-tools/injectable";
import { getDiForUnitTesting } from "../../renderer/getDiForUnitTesting";
import telemetryWhiteListForFunctionsInjectable from "./renderer/telemetry-white-list-for-functions.injectable";
import emitEventInjectable from "../../common/app-event-bus/emit-event.injectable";
import logErrorInjectable from "../../common/log-error.injectable";
import telemetryDecoratorInjectable from "./renderer/telemetry-decorator.injectable";

describe("emit-telemetry-from-specific-function-calls", () => {
  let di: DiContainer;

  beforeEach(() => {
    di = getDiForUnitTesting();

    di.unoverride(telemetryDecoratorInjectable);
  });

  describe("given a telemetry white-list for injectables which instantiate a function", () => {
    let emitEventMock: jest.Mock;

    beforeEach(() => {
      di.override(telemetryWhiteListForFunctionsInjectable, () => [
        "some-white-listed-function",

        {
          id: "some-white-listed-function-with-white-listed-argument",
          getParams: (irrelevantArg, arg) => ({ someParam: arg }),
        },

        {
          id: "some-white-listed-function-with-bad-config",

          getParams: () => {
            throw new Error("some-error-from-bad-configuration");
          },
        },
      ]);

      emitEventMock = jest.fn();
      di.override(emitEventInjectable, () => emitEventMock);
    });

    describe("given instances of white-listed and non-white-listed functions", () => {
      let whiteListedFunctionMock: jest.Mock;
      let nonWhiteListedFunctionMock: jest.Mock;
      let whiteListedFunction: jest.Mock;
      let whiteListedFunctionWithArgument: jest.Mock;
      let whiteListedFunctionWithFaultyConfig: jest.Mock;
      let nonWhiteListedFunction: jest.Mock;
      let logErrorMock: jest.Mock;

      beforeEach(() => {
        whiteListedFunctionMock = jest.fn();
        nonWhiteListedFunctionMock = jest.fn();
        logErrorMock = jest.fn();

        const whiteListedInjectable = getInjectable({
          id: "some-white-listed-function",
          instantiate: () => whiteListedFunctionMock,
        });

        const whiteListedInjectableWithArgument = getInjectable({
          id: "some-white-listed-function-with-white-listed-argument",
          instantiate: () => whiteListedFunctionMock,
        });

        const whiteListedInjectableWithBadConfig = getInjectable({
          id: "some-white-listed-function-with-bad-config",
          instantiate: () => whiteListedFunctionMock,
        });

        const nonWhiteListedInjectable = getInjectable({
          id: "some-non-white-listed-function",
          instantiate: () => nonWhiteListedFunctionMock,
        });

        runInAction(() => {
          di.register(
            whiteListedInjectable,
            whiteListedInjectableWithArgument,
            whiteListedInjectableWithBadConfig,
            nonWhiteListedInjectable,
          );
        });

        di.override(logErrorInjectable, () => logErrorMock);

        whiteListedFunction = di.inject(whiteListedInjectable);

        whiteListedFunctionWithArgument = di.inject(
          whiteListedInjectableWithArgument,
        );

        whiteListedFunctionWithFaultyConfig = di.inject(
          whiteListedInjectableWithBadConfig,
        );

        nonWhiteListedFunction = di.inject(nonWhiteListedInjectable);
      });

      it("telemetry is not emitted yet", () => {
        expect(emitEventMock).not.toHaveBeenCalled();
      });

      it("doesn't log errors, at least yet", () => {
        expect(logErrorMock).not.toHaveBeenCalled();
      });

      describe("when a normal white-listed function is called with arguments", () => {
        beforeEach(() => {
          whiteListedFunction("some-arg", "some-other-arg");
        });

        it("telemetry is emitted in event bus without the arguments", () => {
          expect(emitEventMock).toHaveBeenCalledWith({
            destination: "auto-capture",
            action: "telemetry-from-business-action",
            name: "some-white-listed-function",
          });
        });
      });

      describe("when a white-listed function with a white-listed argument is called with arguments", () => {
        beforeEach(() => {
          whiteListedFunctionWithArgument("some-arg", "some-other-arg");
        });

        it("telemetry is emitted in event bus with the arguments as params", () => {
          expect(emitEventMock).toHaveBeenCalledWith({
            action: "telemetry-from-business-action",
            destination: "auto-capture",
            name: "some-white-listed-function-with-white-listed-argument",
            params: { someParam: "some-other-arg" },
          });
        });
      });

      describe("when a white-listed function with a white-listed argument is called without arguments", () => {
        beforeEach(() => {
          whiteListedFunctionWithArgument();
        });

        it("telemetry is emitted in event bus without params", () => {
          expect(emitEventMock).toHaveBeenCalledWith({
            action: "telemetry-from-business-action",
            destination: "auto-capture",
            name: "some-white-listed-function-with-white-listed-argument",
            params: { someParam: undefined },
          });
        });
      });

      describe("given a faulty configuration, when a white-listed function is called", () => {
        beforeEach(() => {
          whiteListedFunctionWithFaultyConfig();
        });

        it("telemetry is still emitted in event bus, but with params indicating bad configuration, ", () => {
          expect(emitEventMock).toHaveBeenCalledWith({
            action: "telemetry-from-business-action",
            destination: "auto-capture",
            name: "some-white-listed-function-with-bad-config",
            params: { error: "Tried to produce params for telemetry, but getParams() threw an error" },
          });
        });

        it("logs error", () => {
          expect(logErrorMock).toHaveBeenCalledWith(
            'Tried to produce params for telemetry of "some-white-listed-function-with-bad-config", but getParams() threw an error',
            expect.objectContaining({ message: "some-error-from-bad-configuration" }),
          );
        });
      });

      describe("when a white-listed function with a white-listed argument is called with MobX reactive content", () => {
        beforeEach(() => {
          const someComputedProperty = computed(() => "some-computed-value");

          const someObservable = {
            someStaticProperty: "some-static-value",
            someComputedProperty,
          };

          whiteListedFunctionWithArgument(
            "irrelevant-argument",
            someObservable,
          );
        });

        it("telemetry is emitted in event bus without MobX internals or computeds", () => {
          expect(emitEventMock).toHaveBeenCalledWith({
            destination: "auto-capture",
            action: "telemetry-from-business-action",
            name: "some-white-listed-function-with-white-listed-argument",

            params: {
              someParam: {
                someStaticProperty: "some-static-value",
                someComputedProperty: "some-computed-value",
              },
            },
          });
        });
      });

      describe("when the non-white-listed function is called", () => {
        beforeEach(() => {
          nonWhiteListedFunction();
        });

        it("telemetry is not emitted", () => {
          expect(emitEventMock).not.toHaveBeenCalled();
        });
      });
    });
  });
});
