import { getInjectable } from "@ogre-tools/injectable";
import { afterApplicationIsLoadedInjectionToken } from "@k8slens/application";
import renderInjectable from "./render.injectable";
import { ReactApplication } from "../react-application/react-application";
import React from "react";

export const renderApplicationWhenApplicationIsReadyInjectable = getInjectable({
  id: "render-application-when-application-is-ready",

  instantiate: (di) => {
    const render = di.inject(renderInjectable);

    return {
      run: () => {
        render(<ReactApplication di={di} />);
      },
    };
  },

  injectionToken: afterApplicationIsLoadedInjectionToken,
});
