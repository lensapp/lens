import { createContainer, getInjectable } from "@ogre-tools/injectable";
import { registerFeature } from "@k8slens/feature-core";
import { loggerFeature } from "./feature";
import { winstonLoggerInjectable } from "./winston-logger.injectable";

import {
  logDebugInjectionToken,
  logErrorInjectionToken,
  logInfoInjectionToken,
  logSillyInjectionToken,
  logWarningInjectionToken,
} from "./logger.injectable";

import { getFeature } from "@k8slens/feature-core/src/feature";

describe("logger", () => {
  [
    { scenario: "debug", injectionToken: logDebugInjectionToken },
    { scenario: "info", injectionToken: logInfoInjectionToken },
    { scenario: "warn", injectionToken: logWarningInjectionToken },
    { scenario: "error", injectionToken: logErrorInjectionToken },
    { scenario: "silly", injectionToken: logSillyInjectionToken },
  ].forEach(({ scenario, injectionToken }) => {
    it(`given not inside a Feature, when logging "${scenario}", does so without a prefix`, () => {
      const di = createContainer("irrelevant");

      registerFeature(di, loggerFeature);

      const winstonLoggerStub = { [scenario]: jest.fn() } as any;

      di.override(winstonLoggerInjectable, () => winstonLoggerStub);

      const logScenario = di.inject(injectionToken);

      logScenario("some-message", "some-data");

      expect(winstonLoggerStub[scenario]).toHaveBeenCalledWith(
        "some-message",
        "some-data"
      );
    });

    it(`given inside a Feature, when logging "${scenario}", does so with Feature's id as prefix`, () => {
      const di = createContainer("irrelevant");

      const logScenarioInFeature = getInjectable({
        id: "some-functionality",
        instantiate: (di) => di.inject(injectionToken),
      });


      const someFeature = getFeature({
        id: "some-feature",

        register: (di) => {
          di.register(logScenarioInFeature);
        },

        dependencies: [loggerFeature],
      });

      registerFeature(di, someFeature);

      const winstonLoggerStub = { [scenario]: jest.fn() } as any;

      di.override(winstonLoggerInjectable, () => winstonLoggerStub);

      const logScenario = di.inject(logScenarioInFeature);

      logScenario("some-message", "some-data");

      expect(winstonLoggerStub[scenario]).toHaveBeenCalledWith(
        "[SOME-FEATURE]: some-message",
        "some-data"
      );
    });
  });
});
