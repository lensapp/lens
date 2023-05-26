import { getFeature } from "@k8slens/feature-core";
import { reactApplicationFeature } from "@k8slens/react-application";

import { computed } from "mobx";
import { getInjectable } from "@ogre-tools/injectable";
import { reactApplicationChildrenInjectionToken } from "@k8slens/react-application";
import React from "react";

export const mikkoInjectable = getInjectable({
  id: "mikko",

  instantiate: () => ({
    id: "mikkomikko",
    Component: () => (
      <div
        style={{
          height: "500px",
          width: "500px",
          backgroundColor: "green",
          color: "white",
          position: "absolute",
          top: 0,
          right: 0,
          padding: "80px",
          zIndex: 9999,
        }}
      >
        Mikko
      </div>
    ),
    enabled: computed(() => true),
  }),

  injectionToken: reactApplicationChildrenInjectionToken,
});

export const mikkoFeature = getFeature({
  id: "mikko",

  register: (di) => {
    di.register(mikkoInjectable);
  },

  dependencies: [reactApplicationFeature],
});
