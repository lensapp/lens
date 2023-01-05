/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { docsUrl, slackUrl } from "../../../common/vars";
import type { WeblinkData } from "../../../common/weblinks-store/weblink-store";
import { getInjectable } from "@ogre-tools/injectable";
import { weblinkStoreMigrationInjectionToken } from "../../../common/weblinks-store/migration-token";
import * as links from "../links";

const v514WeblinkStoreMigrationInjectable = getInjectable({
  id: "v5.1.4-weblink-store-migration",
  instantiate: () => ({
    version: "5.1.4",
    run(store) {
      const weblinksRaw = store.get("weblinks");
      const weblinks = (Array.isArray(weblinksRaw) ? weblinksRaw : []) as WeblinkData[];

      weblinks.push(
        { id: "https://k8slens.dev", name: links.lensWebsiteLinkName, url: "https://k8slens.dev" },
        { id: docsUrl, name: links.lensDocumentationWeblinkName, url: docsUrl },
        { id: slackUrl, name: links.lensSlackWeblinkName, url: slackUrl },
        { id: "https://twitter.com/k8slens", name: links.lensTwitterWeblinkName, url: "https://twitter.com/k8slens" },
        { id: "https://medium.com/k8slens", name: links.lensBlogWeblinkName, url: "https://medium.com/k8slens" },
        { id: "https://kubernetes.io/docs/home/", name: links.kubernetesDocumentationWeblinkName, url: "https://kubernetes.io/docs/home/" },
      );

      store.set("weblinks", weblinks);
    },
  }),
  injectionToken: weblinkStoreMigrationInjectionToken,
});

export default v514WeblinkStoreMigrationInjectable;
