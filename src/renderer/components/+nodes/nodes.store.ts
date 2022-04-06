/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { sum } from "lodash";
import { computed, makeObservable } from "mobx";

import { apiManager } from "../../../common/k8s-api/api-manager";
import type { Node } from "../../../common/k8s-api/endpoints";
import { nodesApi } from "../../../common/k8s-api/endpoints";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { autoBind } from "../../utils";

export class NodesStore extends KubeObjectStore<Node> {
  api = nodesApi;

  constructor() {
    super();

    makeObservable(this);
    autoBind(this);
  }

  @computed get masterNodes() {
    return this.items.filter(node => node.getRoleLabels().includes("master"));
  }

  @computed get workerNodes() {
    return this.items.filter(node => !node.getRoleLabels().includes("master"));
  }

  getWarningsCount(): number {
    return sum(this.items.map((node: Node) => node.getWarningConditions().length));
  }
}

export const nodesStore = new NodesStore();
apiManager.registerStore(nodesStore);
