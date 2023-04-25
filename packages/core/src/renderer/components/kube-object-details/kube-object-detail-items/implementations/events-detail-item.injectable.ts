/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-detail-item-injection-token";
import { computed } from "mobx";
import { EventDetails } from "../../../events";
import { kubeObjectMatchesToKindAndApiVersion } from "../kube-object-matches-to-kind-and-api-version";
import currentKubeObjectInDetailsInjectable from "../../current-kube-object-in-details.injectable";

const eventsDetailItemInjectable = getInjectable({
  id: "events-detail-item",

  instantiate: (di) => {
    const kubeObject = di.inject(currentKubeObjectInDetailsInjectable);

    return {
      Component: EventDetails,
      enabled: computed(() => isEvent(kubeObject.value.get()?.object)),
      orderNumber: 10,
    };
  },

  injectionToken: kubeObjectDetailItemInjectionToken,
});

const isEvent = kubeObjectMatchesToKindAndApiVersion("Event", ["v1"]);

export default eventsDetailItemInjectable;
