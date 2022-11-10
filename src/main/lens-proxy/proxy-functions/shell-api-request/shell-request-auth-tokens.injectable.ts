/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ClusterId } from "../../../../common/cluster-types";
import type { TabId } from "../../../../renderer/components/dock/dock/store";

const shellRequestAuthTokensInjectable = getInjectable({
  id: "shell-request-auth-tokens",
  instantiate: () => new Map<ClusterId, Map<TabId, Uint8Array>>(),
});

export default shellRequestAuthTokensInjectable;
