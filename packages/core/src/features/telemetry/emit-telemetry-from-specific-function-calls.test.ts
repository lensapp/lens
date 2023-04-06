/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { runInAction } from "mobx";
import type { DiContainer } from "@ogre-tools/injectable";
import { getInjectable } from "@ogre-tools/injectable";
import { getDiForUnitTesting } from "../../renderer/getDiForUnitTesting";
import telemetryWhiteListForParameterlessFunctionsInjectable from "./renderer/telemetry-white-list-for-parameterless-functions.injectable";
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
      di.override(telemetryWhiteListForParameterlessFunctionsInjectable, () => new Set([
        "some-white-listed-function",
      ]));

      emitEventMock = jest.fn();
      di.override(emitEventInjectable, () => emitEventMock);
    });

    describe("given instances of white-listed and non-white-listed functions", () => {
      let whiteListedFunction: jest.Mock;
      let nonWhiteListedFunction: jest.Mock;
      let logErrorMock: jest.Mock;

      beforeEach(() => {
        logErrorMock = jest.fn();

        const whiteListedInjectable = getInjectable({
          id: "some-white-listed-function",
          instantiate: () => jest.fn(),
        });

        const nonWhiteListedInjectable = getInjectable({
          id: "some-non-white-listed-function",
          instantiate: () => jest.fn(),
        });

        runInAction(() => {
          di.register(
            whiteListedInjectable,
            nonWhiteListedInjectable,
          );
        });

        di.override(logErrorInjectable, () => logErrorMock);

        whiteListedFunction = di.inject(whiteListedInjectable);
        nonWhiteListedFunction = di.inject(nonWhiteListedInjectable);
      });

      it("telemetry is not emitted yet", () => {
        expect(emitEventMock).not.toHaveBeenCalled();
      });

      it("doesn't log errors yet", () => {
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
