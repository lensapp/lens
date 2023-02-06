import { createContainer } from "@ogre-tools/injectable";
import { autoRegister } from "@ogre-tools/injectable-extension-for-auto-registration";
import { runInAction } from "mobx";
import { createApp, mainExtensionApi as Main, commonExtensionApi as Common } from "@k8slens/core/main";

import { registerFeature } from '@lensapp/feature-core';

// @ts-ignore
import clusterFeature from '@lensapp/cluster/main';

const di = createContainer("main");
const app = createApp({
  di,
  mode: process.env.NODE_ENV || "development"
});

runInAction(() => {
  try {
    autoRegister({
      di,
      targetModule: module,
      getRequireContexts: () => [
        require.context("./", true, CONTEXT_MATCHER_FOR_NON_FEATURES),
        require.context("../common", true, CONTEXT_MATCHER_FOR_NON_FEATURES),
      ],
    });

    registerFeature(di, clusterFeature);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});

app.start().catch((error) => {
  console.error(error);
  process.exit(1);
})

export {
  Mobx,
  Pty,
} from "@k8slens/core/main";

export const LensExtensions = {
  Main,
  Common,
}
