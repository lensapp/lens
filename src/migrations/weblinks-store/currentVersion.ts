/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { lensSlackWeblinkId, slackUrl } from "../../common/vars";
import type { WeblinkData } from "../../common/weblink-store";
import type { MigrationDeclaration } from "../helpers";
import packageJson from "../../../package.json";

export default {
  // TODO: replace with injection once migrations are made as injectables
  version: packageJson.version, // Run always after upgrade
  run(store) {
    const weblinksRaw: any = store.get("weblinks");
    const weblinks = (Array.isArray(weblinksRaw) ? weblinksRaw : []) as WeblinkData[];
    const slackWeblink = weblinks.find(weblink => weblink.id === lensSlackWeblinkId);

    if (slackWeblink) {
      slackWeblink.url = slackUrl;
    }

    store.set("weblinks", weblinks);
  },
} as MigrationDeclaration;
