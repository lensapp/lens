/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { NodeShellSession } from "./node-shell-session";
import createKubeJsonApiForClusterInjectable from "../k8s-api/create-kube-json-api-for-cluster.injectable";
import resolvedShellInjectable from "../../common/user-preferences/resolved-shell-injectable";
import { bind } from "../../common/utils";

const createNodeShellSessionInjectable = getInjectable({
  instantiate: (di) => bind(NodeShellSession.create, null, {
    createKubeJsonApiForCluster: di.inject(createKubeJsonApiForClusterInjectable),
    resolvedShell: di.inject(resolvedShellInjectable),
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default createNodeShellSessionInjectable;
