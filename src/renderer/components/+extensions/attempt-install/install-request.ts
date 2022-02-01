/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
export interface InstallRequest {
  fileName: string;
  dataP: Promise<Buffer | null>;
}
