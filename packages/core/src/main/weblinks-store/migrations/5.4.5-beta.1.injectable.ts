/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { WeblinkData } from "../../../common/weblinks-store/weblink-store";
import * as links from "../links";
import { getInjectable } from "@ogre-tools/injectable";
import { weblinkStoreMigrationInjectionToken } from "../../../common/weblinks-store/migration-token";

const v545Beta1WeblinkStoreMigrationInjectable = getInjectable({
  id: "v5.4.5-beta.1-weblink-store-migration",
  instantiate: () => ({
    version: "5.4.5-beta.1 || >=5.5.0-alpha.0",
    run(store) {
      const weblinksRaw = store.get("weblinks");
      const weblinks = (Array.isArray(weblinksRaw) ? weblinksRaw : []) as WeblinkData[];

      const lensWebsiteLink = weblinks.find(weblink => weblink.name === links.lensWebsiteLinkName);

      if (lensWebsiteLink) {
        lensWebsiteLink.id = links.lensWebsiteWeblinkId;
      }

      const lensDocumentationWeblinkLink = weblinks.find(weblink => weblink.name === links.lensDocumentationWeblinkName);

      if (lensDocumentationWeblinkLink) {
        lensDocumentationWeblinkLink.id = links.lensDocumentationWeblinkId;
      }

      const lensSlackWeblinkLink = weblinks.find(weblink => weblink.name === links.lensSlackWeblinkName);

      if (lensSlackWeblinkLink) {
        lensSlackWeblinkLink.id = links.lensSlackWeblinkId;
      }

      const lensTwitterWeblinkLink = weblinks.find(weblink => weblink.name === links.lensTwitterWeblinkName);

      if (lensTwitterWeblinkLink) {
        lensTwitterWeblinkLink.id = links.lensTwitterWeblinkId;
      }

      const lensBlogWeblinkLink = weblinks.find(weblink => weblink.name === links.lensBlogWeblinkName);

      if (lensBlogWeblinkLink) {
        lensBlogWeblinkLink.id = links.lensBlogWeblinkId;
      }

      const kubernetesDocumentationWeblinkLink = weblinks.find(weblink => weblink.name === links.kubernetesDocumentationWeblinkName);

      if (kubernetesDocumentationWeblinkLink) {
        kubernetesDocumentationWeblinkLink.id = links.kubernetesDocumentationWeblinkId;
      }

      store.set("weblinks", weblinks);
    },
  }),
  injectionToken: weblinkStoreMigrationInjectionToken,
});

export default v545Beta1WeblinkStoreMigrationInjectable;
