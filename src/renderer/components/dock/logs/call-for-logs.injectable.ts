/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import podApiInjectable from "../../../../common/k8s-api/endpoints/pod.api.injectable";

const callForLogsInjectable = getInjectable({
  instantiate: (di) => di.inject(podApiInjectable).getLogs,
  lifecycle: lifecycleEnum.singleton,
});

export default callForLogsInjectable;
