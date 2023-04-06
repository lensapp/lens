/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, createInstantiationTargetDecorator, instantiationDecoratorToken } from "@ogre-tools/injectable";
import { pick } from "lodash";
import { parseKubeApi } from "../../../common/k8s-api/kube-api-parse";
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
              try {
                return {
                  resource: pick(parseKubeApi(args[0]), "apiPrefix", "apiVersion", "apiGroup", "namespace", "resource", "name"),
                };
              } catch (error) {
                return { error: `${error}` };
              }
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
