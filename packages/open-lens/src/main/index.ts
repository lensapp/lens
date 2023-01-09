import { createContainer } from "@ogre-tools/injectable";
import { autoRegister } from "@ogre-tools/injectable-extension-for-auto-registration";
import { runInAction } from "mobx";
import { createApp, extensionApi } from "@k8slens/open-lens/main";

const di = createContainer("main");
const app = createApp({
  di,
  mode: process.env.NODE_ENV || "development"
});

runInAction(() => {
  try {
    autoRegister({
      di,
      requireContexts: [
        require.context("./", true, CONTEXT_MATCHER_FOR_NON_FEATURES),
        require.context("../common", true, CONTEXT_MATCHER_FOR_NON_FEATURES),
      ],
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});

app.start().catch((error) => {
  console.error(error);
  process.exit(1);
})

const { Mobx, LensExtensions, Pty } = extensionApi;

export {
  Mobx,
  LensExtensions,
  Pty
};
