/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, createInstantiationTargetDecorator, instantiationDecoratorToken } from "@ogre-tools/injectable";
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
        emitTelemetry({
          action: showDetailsInjectable.id,
          params: {
            kind: (() => {
              try {
                return parseKubeApi(args[0] || "").resource;
              } catch {
                return "";
              }
            })(),
          },
        });

        return showDetails(...args);
      };
    },
  }),
  decorable: false,
  injectionToken: instantiationDecoratorToken,
});

export default telemetryDecoratorForShowDetailsInjectable;
