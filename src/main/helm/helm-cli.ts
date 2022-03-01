/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import path from "path";
import { onceCell } from "../../common/utils/once-cell";
import { baseBinariesDir, getBinaryName } from "../../common/vars";

export const helmBinaryPath = onceCell(() => path.join(baseBinariesDir.get(), getBinaryName("helm")));

/**
 * @deprecated use `helmBinaryPath` or its injection equivalent instead
 */
export const helmCli = {
  binaryPath: (): Promise<string> => Promise.resolve(helmBinaryPath.get()),
  getBinaryPath: (): string => helmBinaryPath.get(),
  getBinaryDir: (): string => baseBinariesDir.get(),
  setLogger: (logger: any): void => void logger,
  ensureBinary: (): Promise<void> => Promise.resolve(),
};

