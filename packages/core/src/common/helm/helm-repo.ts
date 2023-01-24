/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

export interface HelmRepo {
  name: string;
  url: string;
  cacheFilePath: string;
  caFile?: string;
  certFile?: string;
  insecureSkipTlsVerify?: boolean;
  keyFile?: string;
  username?: string;
  password?: string;
}
