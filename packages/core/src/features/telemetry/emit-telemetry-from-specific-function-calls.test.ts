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
      ]);

      emitEventMock = jest.fn();
      di.override(emitEventInjectable, () => emitEventMock);
    });

    describe("given instances of white-listed, non-white-listed and tagged functions", () => {
      let whiteListedFunctionMock: jest.Mock;
      let nonWhiteListedFunctionMock: jest.Mock;
      let taggedFunctionMock: jest.Mock;
      let injectedWhiteListedFunction: jest.Mock;
      let injectedNonWhiteListedFunction: jest.Mock;
      let injectedTaggedFunction: jest.Mock;

      beforeEach(() => {
        whiteListedFunctionMock = jest.fn();
        nonWhiteListedFunctionMock = jest.fn();
        taggedFunctionMock = jest.fn();

        const whiteListedInjectable = getInjectable({
          id: "some-white-listed-function",
          instantiate: () => whiteListedFunctionMock,
        });

        const nonWhiteListedInjectable = getInjectable({
          id: "some-non-white-listed-function",
          instantiate: () => nonWhiteListedFunctionMock,
        });

        const taggedInjectable = getInjectable({
          id: "some-tagged-function",
          instantiate: () => taggedFunctionMock,
          tags: ["emit-telemetry"],
        });

        runInAction(() => {
          di.register(whiteListedInjectable);
          di.register(nonWhiteListedInjectable);
          di.register(taggedInjectable);
        });

        injectedWhiteListedFunction = di.inject(whiteListedInjectable);
        injectedNonWhiteListedFunction = di.inject(nonWhiteListedInjectable);
        injectedTaggedFunction = di.inject(taggedInjectable);
      });

      it("telemetry is not emitted yet", () => {
        expect(emitEventMock).not.toHaveBeenCalled();
      });

      describe("when the white-listed function is called", () => {
        beforeEach(() => {
          injectedWhiteListedFunction("some-arg", "some-other-arg");
        });

        it("telemetry is emitted in event bus", () => {
          expect(emitEventMock).toHaveBeenCalledWith({
            destination: "auto-capture",
            action: "telemetry-from-business-action",
            name: "some-white-listed-function",
            params: { args: ["some-arg", "some-other-arg"] },
          });
        });
      });

      describe("when the white-listed function is called with MobX reactive content", () => {
        beforeEach(() => {
          const someComputedProperty = computed(() => "some-computed-value");

          const someObservable = {
            someStaticProperty: "some-static-value",
            someComputedProperty,
          };

          injectedWhiteListedFunction(someObservable);
        });

        it("telemetry is emitted in event bus without MobX internals or computeds", () => {
          expect(emitEventMock).toHaveBeenCalledWith({
            destination: "auto-capture",
            action: "telemetry-from-business-action",
            name: "some-white-listed-function",

            params: {
              args: [
                {
                  someStaticProperty: "some-static-value",
                  someComputedProperty: "some-computed-value",
                },
              ],
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

      describe("when the tagged, but not white-listed function is called", () => {
        beforeEach(() => {
          injectedTaggedFunction("some-arg", "some-other-arg");
        });

        it("telemetry is emitted in event bus", () => {
          expect(emitEventMock).toHaveBeenCalledWith({
            destination: "auto-capture",
            action: "telemetry-from-business-action",
            name: "some-tagged-function",
            params: { args: ["some-arg", "some-other-arg"] },
          });
        });
      });
    });
  });
});
