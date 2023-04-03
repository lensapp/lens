import "@k8slens/core/styles";
import { runInAction } from "mobx";
import {
  rendererExtensionApi as Renderer,
  commonExtensionApi as Common,
  registerLensCore,
} from "@k8slens/core/renderer";
import { autoRegister } from "@ogre-tools/injectable-extension-for-auto-registration";
import { registerFeature } from "@k8slens/feature-core";
import {
  applicationFeature,
  startApplicationInjectionToken
} from "@k8slens/application";
import { createContainer } from "@ogre-tools/injectable";
import { registerMobX } from "@ogre-tools/injectable-extension-for-mobx";
import { registerInjectableReact } from "@ogre-tools/injectable-react";
import { messagingFeatureForRenderer } from "@k8slens/messaging-for-renderer";
import { keyboardShortcutsFeature } from "@k8slens/keyboard-shortcuts";
import { reactApplicationFeature } from "@k8slens/react-application";

const environment = "renderer";

const di = createContainer(environment);

runInAction(() => {
  registerMobX(di);
  registerInjectableReact(di);
  registerLensCore(di, environment);

  registerFeature(
    di,
    applicationFeature,
    messagingFeatureForRenderer,
    keyboardShortcutsFeature,
    reactApplicationFeature
  );

  autoRegister({
    di,
    targetModule: module,
    getRequireContexts: () => [
      require.context("./", true, CONTEXT_MATCHER_FOR_NON_FEATURES),
      require.context("../common", true, CONTEXT_MATCHER_FOR_NON_FEATURES),
    ],
  });
});

const startApplication = di.inject(startApplicationInjectionToken);

startApplication();

export {
  React,
  ReactDOM,
  ReactRouter,
  ReactRouterDom,
  Mobx,
  MobxReact,
} from "@k8slens/core/renderer";

export const LensExtensions = {
  Renderer,
  Common,
};
