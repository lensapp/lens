/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

export interface VolumeMount {
  name: string;
  readOnly?: boolean;
  mountPath: string;
  mountPropagation?: string;
  subPath?: string;
  subPathExpr?: string;
}
