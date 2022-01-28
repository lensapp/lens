/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { docsUrl, slackUrl } from "../../../common/vars";
import type { WeblinkData, WeblinkStoreModel } from "../../../common/weblinks/store";
import type { MigrationDeclaration } from "../helpers";

export default {
  version: "5.1.4",
  run(store) {
    const weblinksRaw: any = store.get("weblinks");
    const weblinks = (Array.isArray(weblinksRaw) ? weblinksRaw : []) as WeblinkData[];

    weblinks.push(
      { id: "https://k8slens.dev", name: "Lens Website", url: "https://k8slens.dev" },
      { id: docsUrl, name: "Lens Documentation", url: docsUrl },
      { id: slackUrl, name: "Lens Community Slack", url: slackUrl },
      { id: "https://kubernetes.io/docs/home/", name: "Kubernetes Documentation", url: "https://kubernetes.io/docs/home/" },
      { id: "https://twitter.com/k8slens", name: "Lens on Twitter", url: "https://twitter.com/k8slens" },
      { id: "https://medium.com/k8slens", name: "Lens Official Blog", url: "https://medium.com/k8slens" },
    );

    store.set("weblinks", weblinks);
  },
} as MigrationDeclaration<WeblinkStoreModel>;
