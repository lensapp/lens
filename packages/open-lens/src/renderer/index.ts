import "@k8slens/open-lens/styles";
import { createContainer } from "@ogre-tools/injectable";
import { runInAction } from "mobx";
import { createApp, extensionApi } from "@k8slens/open-lens/renderer";
import { autoRegister } from "@ogre-tools/injectable-extension-for-auto-registration";

const di = createContainer("renderer");
const app = createApp({
  di,
  mode: process.env.NODE_ENV || "development"
});

runInAction(() => {
  autoRegister({
    di,
    requireContexts: [
      require.context("./", true, CONTEXT_MATCHER_FOR_NON_FEATURES),
      require.context("../common", true, CONTEXT_MATCHER_FOR_NON_FEATURES),
    ],
  });
});

app.start();

const {
  React,
  ReactDOM,
  ReactRouter,
  ReactRouterDom,
  Mobx,
  MobxReact,
  LensExtensions
} = extensionApi;

export {
  React,
  ReactDOM,
  ReactRouter,
  ReactRouterDom,
  Mobx,
  MobxReact,
  LensExtensions
};
