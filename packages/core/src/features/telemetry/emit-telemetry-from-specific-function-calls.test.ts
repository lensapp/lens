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

describe("emit-telemetry-from-specific-function-calls", () => {
  let di: DiContainer;

  beforeEach(() => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });
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
      ]);

      emitEventMock = jest.fn();
      di.override(emitEventInjectable, () => emitEventMock);
    });

    describe("given instances of white-listed, non-white-listed", () => {
      let whiteListedFunctionMock: jest.Mock;
      let nonWhiteListedFunctionMock: jest.Mock;
      let injectedWhiteListedFunction: jest.Mock;
      let injectedWhiteListedFunctionWithArgument: jest.Mock;
      let injectedNonWhiteListedFunction: jest.Mock;

      beforeEach(() => {
        whiteListedFunctionMock = jest.fn();
        nonWhiteListedFunctionMock = jest.fn();

        const whiteListedInjectable = getInjectable({
          id: "some-white-listed-function",
          instantiate: () => whiteListedFunctionMock,
        });

        const whiteListedInjectableWithArgument = getInjectable({
          id: "some-white-listed-function-with-white-listed-argument",
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
            nonWhiteListedInjectable,
          );
        });

        injectedWhiteListedFunction = di.inject(whiteListedInjectable);

        injectedWhiteListedFunctionWithArgument = di.inject(
          whiteListedInjectableWithArgument,
        );

        injectedNonWhiteListedFunction = di.inject(nonWhiteListedInjectable);
      });

      it("telemetry is not emitted yet", () => {
        expect(emitEventMock).not.toHaveBeenCalled();
      });

      describe("when a normal white-listed function is called with arguments", () => {
        beforeEach(() => {
          injectedWhiteListedFunction("some-arg", "some-other-arg");
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
          injectedWhiteListedFunctionWithArgument("some-arg", "some-other-arg");
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
          injectedWhiteListedFunctionWithArgument();
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

      describe("when the white-listed function with a white-listed argument is called with MobX reactive content", () => {
        beforeEach(() => {
          const someComputedProperty = computed(() => "some-computed-value");

          const someObservable = {
            someStaticProperty: "some-static-value",
            someComputedProperty,
          };

          injectedWhiteListedFunctionWithArgument(
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
          injectedNonWhiteListedFunction();
        });

        it("telemetry is not emitted", () => {
          expect(emitEventMock).not.toHaveBeenCalled();
        });
      });
    });
  });
});
