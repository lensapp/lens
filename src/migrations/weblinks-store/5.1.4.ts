/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { docsUrl, slackUrl } from "../../common/vars";
import type { WeblinkData } from "../../common/weblink-store";
import type { MigrationDeclaration } from "../helpers";

export const lensWebsiteLinkName = "Lens Website";
export const lensDocumentationWeblinkName = "Lens Documentation";
export const lensSlackWeblinkName = "Lens Community Slack";
export const lensTwitterWeblinkName = "Lens on Twitter";
export const lensBlogWeblinkName = "Lens Official Blog";
export const kubernetesDocumentationWeblinkName = "Kubernetes Documentation";

export default {
  version: "5.1.4",
  run(store) {
    const weblinksRaw: any = store.get("weblinks");
    const weblinks = (Array.isArray(weblinksRaw) ? weblinksRaw : []) as WeblinkData[];

    weblinks.push(
      { id: "https://k8slens.dev", name: lensWebsiteLinkName, url: "https://k8slens.dev" },
      { id: docsUrl, name: lensDocumentationWeblinkName, url: docsUrl },
      { id: slackUrl, name: lensSlackWeblinkName, url: slackUrl },
      { id: "https://twitter.com/k8slens", name: lensTwitterWeblinkName, url: "https://twitter.com/k8slens" },
      { id: "https://medium.com/k8slens", name: lensBlogWeblinkName, url: "https://medium.com/k8slens" },
      { id: "https://kubernetes.io/docs/home/", name: kubernetesDocumentationWeblinkName, url: "https://kubernetes.io/docs/home/" },
    );

    store.set("weblinks", weblinks);
  },
} as MigrationDeclaration;
