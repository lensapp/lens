/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { FrameContext } from "./cluster-frame-context";
import hostedClusterInjectable from "../../common/cluster-store/hosted-cluster/hosted-cluster.injectable";
import namespacesInjectable from "../components/+namespaces/namespaces.injectable";
import selectedNamespacesInjectable from "../components/+namespaces/selected-namespaces.injectable";

const frameContextInjectable = getInjectable({
  instantiate: (di) => new FrameContext({
    cluster: di.inject(hostedClusterInjectable),
    namespaces: di.inject(namespacesInjectable),
    selectedNamespaces: di.inject(selectedNamespacesInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default frameContextInjectable;
