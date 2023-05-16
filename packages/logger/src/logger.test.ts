import { createContainer } from "@ogre-tools/injectable";
import { registerFeature } from "@k8slens/feature-core";
import { loggerFeature } from "./feature";
import { winstonLoggerInjectable } from "./winston-logger.injectable";
import {
  logDebugInjectionToken, logErrorInjectionToken,
  logInfoInjectionToken,
  logSillyInjectionToken, logWarningInjectionToken,
} from "./logger.injectable";

describe("logger", () => {
  [
    { scenario: "debug", injectionToken: logDebugInjectionToken },
    { scenario: "info", injectionToken: logInfoInjectionToken },
    { scenario: "warn", injectionToken: logWarningInjectionToken },
    { scenario: "error", injectionToken: logErrorInjectionToken },
    { scenario: "silly", injectionToken: logSillyInjectionToken },
  ].forEach(({ scenario, injectionToken }) => {
    it(`when logging "${scenario}", does so`, () => {
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
  });
});
