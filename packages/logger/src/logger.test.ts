import { createContainer, getInjectable } from "@ogre-tools/injectable";
import { registerFeature } from "@k8slens/feature-core";
import { loggerFeature } from "./feature";
import { winstonLoggerInjectable } from "./winston-logger.injectable";
import TransportStream from "winston-transport";

import {
  logDebugInjectionToken,
  logErrorInjectionToken,
  loggerInjectable,
  logInfoInjectionToken,
  logSillyInjectionToken,
  logWarningInjectionToken,
} from "./logger.injectable";

import { getFeature } from "@k8slens/feature-core/src/feature";
import { loggerTransportInjectionToken } from "./transports";
import { prefixedLoggerInjectable } from "./prefixed-logger.injectable";

describe("logger", () => {
  [
    { scenario: "debug" as const, injectionToken: logDebugInjectionToken },
    { scenario: "info" as const, injectionToken: logInfoInjectionToken },
    { scenario: "warn" as const, injectionToken: logWarningInjectionToken },
    { scenario: "error" as const, injectionToken: logErrorInjectionToken },
    { scenario: "silly" as const, injectionToken: logSillyInjectionToken },
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

    it(`given not inside a Feature, when logging "${scenario}" using legacy logger, does so without a prefix`, () => {
      const di = createContainer("irrelevant");

      registerFeature(di, loggerFeature);

      const winstonLoggerStub = { [scenario]: jest.fn() } as any;

      di.override(winstonLoggerInjectable, () => winstonLoggerStub);

      const logger = di.inject(loggerInjectable);

      logger[scenario]("some-message", "some-data");

      expect(winstonLoggerStub[scenario]).toHaveBeenCalledWith(
        "some-message",
        "some-data"
      );
    });

    it(`given not inside a Feature, when logging "${scenario}" using legacy prefixed logger, does so without a feature prefix`, () => {
      const di = createContainer("irrelevant");

      registerFeature(di, loggerFeature);

      const winstonLoggerStub = { [scenario]: jest.fn() } as any;

      di.override(winstonLoggerInjectable, () => winstonLoggerStub);

      const logger = di.inject(prefixedLoggerInjectable, "A-PREFIX");

      logger[scenario]("some-message", "some-data");

      expect(winstonLoggerStub[scenario]).toHaveBeenCalledWith(
        "[A-PREFIX]: some-message",
        "some-data"
      );
    });

    it(`given inside a Feature, when logging "${scenario}", does so with Feature's id as prefix without trailing '-feature' to avoid redundancy`, () => {
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
        "[SOME]: some-message",
        "some-data"
      );
    });
  });

  it("given a single transport, when logging, does not throw, and does call the transport", () => {
    const di = createContainer("irrelevant");
    const log = jest.fn().mockImplementation((data, next) => next());

    registerFeature(di, loggerFeature);

    di.register(
      getInjectable({
        id: "some-transport",
        instantiate: () => new TransportStream({ log }),
        injectionToken: loggerTransportInjectionToken,
      })
    );

    const logger = di.inject(loggerInjectable);

    logger.info("some-message", "some-data");

    expect(log).toHaveBeenCalled();
  });
});
