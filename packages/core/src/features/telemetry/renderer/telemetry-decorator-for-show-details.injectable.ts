/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, createInstantiationTargetDecorator, instantiationDecoratorToken } from "@ogre-tools/injectable";
import { pick } from "lodash";
import { inspect } from "util";
import { parseKubeApi } from "@k8slens/kube-api";
import showDetailsInjectable from "../../../renderer/components/kube-detail-params/show-details.injectable";
import emitTelemetryInjectable from "./emit-telemetry.injectable";

const telemetryDecoratorForShowDetailsInjectable = getInjectable({
  id: "telemetry-decorator-for-show-details",
  instantiate: (diForDecorator) => createInstantiationTargetDecorator({
    target: showDetailsInjectable,
    decorate: (instantiate) => (di) => {
      const emitTelemetry = diForDecorator.inject(emitTelemetryInjectable);
      const showDetails = instantiate(di);

      return (...args) => {
        const params = args[0]
          ? {
            action: "open",
            ...(() => {
              const parsedApi = parseKubeApi(args[0]);

              if (!parsedApi) {
                return { error: `invalid apiPath: ${inspect(args[0])}` };
              }

              return {
                resource: pick(parsedApi, "apiPrefix", "apiVersion", "apiGroup", "namespace", "resource", "name"),
              };
            })(),
          }
          : {
            action: "close",
          };

        emitTelemetry({
          action: showDetailsInjectable.id,
          params,
        });

        return showDetails(...args);
      };
    },
  }),
  decorable: false,
  injectionToken: instantiationDecoratorToken,
});

export default telemetryDecoratorForShowDetailsInjectable;
