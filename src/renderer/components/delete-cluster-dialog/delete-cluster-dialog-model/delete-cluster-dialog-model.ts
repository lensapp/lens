/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { KubeConfig } from "@kubernetes/client-node";
import { observable, makeObservable, action } from "mobx";
import type { Cluster } from "../../../../common/cluster/cluster";

export class DeleteClusterDialogModel {
  isOpen = false;

  constructor() {
    makeObservable(this, {
      isOpen: observable,
      open: action,
      close: action,
    });
  }

  cluster: Cluster;
  config: KubeConfig;

  open = ({ cluster, config }: { cluster: Cluster; config: KubeConfig }) => {
    this.isOpen = true;

    this.cluster = cluster;
    this.config = config;
  };

  close = () => {
    this.isOpen = false;
  };
}
