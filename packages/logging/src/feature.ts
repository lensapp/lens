import { getFeature } from "@k8slens/feature-core";
import { logErrorInjectable } from "./log-error.injectable";
import { loggerInjectable } from "./logger.injectable";
import { prefixedLoggerInjectable } from "./prefixed-logger.injectable";
import { winstonLoggerInjectable } from "./winston-logger.injectable";

export const loggingFeature = getFeature({
  id: "logging",

  register: (di) => {
    di.register(logErrorInjectable);
    di.register(loggerInjectable);
    di.register(prefixedLoggerInjectable);
    di.register(winstonLoggerInjectable);
  },
});
