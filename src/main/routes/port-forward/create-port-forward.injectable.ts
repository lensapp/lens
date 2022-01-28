/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { PortForward } from "./port-forward";
import { bind } from "../../../common/utils";
import bundledKubectlPathInjectable from "../../kubectl/get-bundled-path.injectable";

const createPortForwardInjectable = getInjectable({
  instantiate: (di) => bind(PortForward.create, null, {
    bundledKubectlPath: di.inject(bundledKubectlPathInjectable),
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default createPortForwardInjectable;
