/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import * as links from "../../../features/weblinks/main/links";
import { getInjectable } from "@ogre-tools/injectable";
import { weblinkStoreMigrationInjectionToken } from "../../../features/weblinks/common/migration-token";
import type { WeblinkData } from "../common/storage.injectable";

const v545Beta1WeblinkStoreMigrationInjectable = getInjectable({
  id: "v5.4.5-beta.1-weblink-store-migration",
  instantiate: () => ({
    version: "5.4.5-beta.1 || >=5.5.0-alpha.0",
    run(store) {
      const weblinksRaw = store.get("weblinks");
      const weblinks = (Array.isArray(weblinksRaw) ? weblinksRaw : []) as WeblinkData[];

      const lensWebsite = weblinks.find(weblink => weblink.name === links.lensWebsiteLinkName);

      if (lensWebsite) {
        lensWebsite.id = links.lensWebsiteWeblinkId;
      }

      const lensDocumentationWeblink = weblinks.find(weblink => weblink.name === links.lensDocumentationWeblinkName);

      if (lensDocumentationWeblink) {
        lensDocumentationWeblink.id = links.lensDocumentationWeblinkId;
      }

      const lensForumsWeblink = weblinks.find(weblink => weblink.name === links.lensForumsWeblinkName);

      if (lensForumsWeblink) {
        lensForumsWeblink.id = links.lensForumsWeblinkId;
      }

      const lensTwitterWeblink = weblinks.find(weblink => weblink.name === links.lensTwitterWeblinkName);

      if (lensTwitterWeblink) {
        lensTwitterWeblink.id = links.lensTwitterWeblinkId;
      }

      const lensBlogWeblink = weblinks.find(weblink => weblink.name === links.lensBlogWeblinkName);

      if (lensBlogWeblink) {
        lensBlogWeblink.id = links.lensBlogWeblinkId;
      }

      const kubernetesDocumentationWeblink = weblinks.find(weblink => weblink.name === links.kubernetesDocumentationWeblinkName);

      if (kubernetesDocumentationWeblink) {
        kubernetesDocumentationWeblink.id = links.kubernetesDocumentationWeblinkId;
      }

      store.set("weblinks", weblinks);
    },
  }),
  injectionToken: weblinkStoreMigrationInjectionToken,
});

export default v545Beta1WeblinkStoreMigrationInjectable;
