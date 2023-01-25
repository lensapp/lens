/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { docsUrl, slackUrl } from "../../../common/vars";
import type { WeblinkData } from "../../../common/weblinks-store/weblink-store";
import { getInjectable } from "@ogre-tools/injectable";
import { weblinkStoreMigrationInjectionToken } from "../../../common/weblinks-store/migration-token";
import applicationInformationToken from "../../../common/vars/application-information-token";
import { lensDocumentationWeblinkId, lensSlackWeblinkId } from "../links";

const currentVersionWeblinkStoreMigrationInjectable = getInjectable({
  id: "current-version-weblink-store-migration",
  instantiate: (di) => {
    const { version } = di.inject(applicationInformationToken);

    return {
      version, // Run always after upgrade
      run(store) {
        const weblinksRaw = store.get("weblinks");
        const weblinks = (Array.isArray(weblinksRaw) ? weblinksRaw : []) as WeblinkData[];
        const slackWeblink = weblinks.find(weblink => weblink.id === lensSlackWeblinkId);

        if (slackWeblink) {
          slackWeblink.url = slackUrl;
        }

        const docsWeblink = weblinks.find(weblink => weblink.id === lensDocumentationWeblinkId);

        if (docsWeblink) {
          docsWeblink.url = docsUrl;
        }

        store.set("weblinks", weblinks);
      },
    };
  },
  injectionToken: weblinkStoreMigrationInjectionToken,
});

export default currentVersionWeblinkStoreMigrationInjectable;
