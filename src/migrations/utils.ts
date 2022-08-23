/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { createHash } from "crypto";

export function generateNewIdFor(cluster: { kubeConfigPath: string; contextName: string }): string {
  return createHash("md5").update(`${cluster.kubeConfigPath}:${cluster.contextName}`).digest("hex");
}
