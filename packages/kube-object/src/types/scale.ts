/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeObjectMetadata } from "../api-types";

export interface Scale {
  apiVersion: "autoscaling/v1";
  kind: "Scale";
  metadata: KubeObjectMetadata;
  spec: {
    replicas: number;
  };
  status: {
    replicas: number;
    selector: string;
  };
}

export interface ScaleCreateOptions {
  apiVersion?: "autoscaling/v1";
  kind?: "Scale";
  spec: {
    replicas: number;
  };
}
