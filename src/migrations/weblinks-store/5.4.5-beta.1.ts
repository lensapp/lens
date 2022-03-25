/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { kubernetesDocumentationWeblinkId, lensBlogWeblinkId, lensDocumentationWeblinkId, lensSlackWeblinkId, lensTwitterWeblinkId, lensWebsiteWeblinkId } from "../../common/vars";
import type { WeblinkData } from "../../common/weblink-store";
import type { MigrationDeclaration } from "../helpers";
import { kubernetesDocumentationWeblinkName, lensBlogWeblinkName, lensDocumentationWeblinkName, lensSlackWeblinkName, lensTwitterWeblinkName, lensWebsiteLinkName } from "./5.1.4";

export default {
  version: "5.4.5-beta.1 || >=5.5.0-alpha.0",
  run(store) {
    const weblinksRaw: any = store.get("weblinks");
    const weblinks = (Array.isArray(weblinksRaw) ? weblinksRaw : []) as WeblinkData[];

    const lensWebsiteLink = weblinks.find(weblink => weblink.name === lensWebsiteLinkName);

    if (lensWebsiteLink) {
      lensWebsiteLink.id = lensWebsiteWeblinkId;
    }

    const lensDocumentationWeblinkLink = weblinks.find(weblink => weblink.name === lensDocumentationWeblinkName);

    if (lensDocumentationWeblinkLink) {
      lensDocumentationWeblinkLink.id = lensDocumentationWeblinkId;
    }

    const lensSlackWeblinkLink = weblinks.find(weblink => weblink.name === lensSlackWeblinkName);

    if (lensSlackWeblinkLink) {
      lensSlackWeblinkLink.id = lensSlackWeblinkId;
    }

    const lensTwitterWeblinkLink = weblinks.find(weblink => weblink.name === lensTwitterWeblinkName);

    if (lensTwitterWeblinkLink) {
      lensTwitterWeblinkLink.id = lensTwitterWeblinkId;
    }

    const lensBlogWeblinkLink = weblinks.find(weblink => weblink.name === lensBlogWeblinkName);

    if (lensBlogWeblinkLink) {
      lensBlogWeblinkLink.id = lensBlogWeblinkId;
    }

    const kubernetesDocumentationWeblinkLink = weblinks.find(weblink => weblink.name === kubernetesDocumentationWeblinkName);

    if (kubernetesDocumentationWeblinkLink) {
      kubernetesDocumentationWeblinkLink.id = kubernetesDocumentationWeblinkId;
    }

    store.set("weblinks", weblinks);
  },
} as MigrationDeclaration;
