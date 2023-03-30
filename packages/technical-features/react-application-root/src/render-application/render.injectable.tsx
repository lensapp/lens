import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import { render } from "react-dom";
import type React from "react";

export type Render = (application: React.ReactElement) => void;

export const renderInjectionToken = getInjectionToken<Render>({
  id: "render-injection-token",
});

const renderInjectable = getInjectable({
  id: "render",

  /* c8 ignore next */
  instantiate: () => (application) => render(application, document.getElementById("app")),

  causesSideEffects: true,

  injectionToken: renderInjectionToken,
});

export default renderInjectable;
