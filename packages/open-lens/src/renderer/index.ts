import "@k8slens/core/styles";
import { runInAction } from "mobx";
import { createApplication, rendererExtensionApi as Renderer, commonExtensionApi as Common } from "@k8slens/core/renderer";
import { autoRegister } from "@ogre-tools/injectable-extension-for-auto-registration";

const app = createApplication({
  mode: process.env.NODE_ENV || "development"
});

runInAction(() => {
  autoRegister({
    di: app.di,
    targetModule: module,
    getRequireContexts: () => [
      require.context("./", true, CONTEXT_MATCHER_FOR_NON_FEATURES),
      require.context("../common", true, CONTEXT_MATCHER_FOR_NON_FEATURES),
    ],
  });
});

app.start();

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
