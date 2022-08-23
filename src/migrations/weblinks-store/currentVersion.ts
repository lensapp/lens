/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getAppVersion } from "../../common/utils";
import { lensSlackWeblinkId, slackUrl } from "../../common/vars";
import type { WeblinkData } from "../../common/weblink-store";
import type { MigrationDeclaration } from "../helpers";

export default {
  version: getAppVersion(), // Run always after upgrade
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
