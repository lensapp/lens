/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ExtractOptions } from "tar";
import { extract } from "tar";
import getDirnameOfPathInjectable from "../path/get-dirname.injectable";

export type ExtractTar = (filePath: string, opts?: ExtractOptions) => Promise<void>;

const extractTarInjectable = getInjectable({
  id: "extract-tar",
  instantiate: (di): ExtractTar => {
    const getDirnameOfPath = di.inject(getDirnameOfPathInjectable);

    return (filePath, opts = {}) => extract({
      file: filePath,
      cwd: getDirnameOfPath(filePath),
      ...opts,
    });
  },
  causesSideEffects: true,
});

export default extractTarInjectable;
