/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { podsApi } from "../../../../common/k8s-api/endpoints";

const callForLogsInjectable = getInjectable({
  id: "call-for-logs",
  instantiate: () => podsApi.getLogs,
});

export default callForLogsInjectable;
