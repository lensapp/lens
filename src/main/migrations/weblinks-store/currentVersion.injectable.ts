/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { lensSlackWeblinkId, slackUrl } from "../../../common/vars";
import type { WeblinkData } from "../../../common/weblinks/store";
import { getInjectable } from "@ogre-tools/injectable";
import { weblinksStoreMigrationDeclarationInjectionToken } from "./migration";
import appVersionInjectable from "../../../common/get-configuration-file-model/app-version/app-version.injectable";

const weblinksStoreCurrentVersionMigrationInjectable = getInjectable({
  id: "weblinks-store-current-version-migration",
  instantiate: (di) => ({
    version: di.inject(appVersionInjectable), // Run always after upgrade
    run(store) {
      const weblinksRaw = store.get("weblinks");
      const weblinks = (Array.isArray(weblinksRaw) ? weblinksRaw : []) as WeblinkData[];
      const slackWeblink = weblinks.find(weblink => weblink.id === lensSlackWeblinkId);

      if (slackWeblink) {
        slackWeblink.url = slackUrl;
      }

      store.set("weblinks", weblinks);
    },
  }),
  injectionToken: weblinksStoreMigrationDeclarationInjectionToken,
});

export default weblinksStoreCurrentVersionMigrationInjectable;

