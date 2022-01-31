/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { EnsureOptions, WriteOptions } from "fs-extra";
import path from "path";
import type { JsonValue } from "type-fest";
import fsInjectable from "./fs.injectable";

interface Dependencies {
  writeJson: (file: string, object: any, options?: WriteOptions | BufferEncoding | string) => Promise<void>;
  ensureDir: (dir: string, options?: EnsureOptions | number) => Promise<void>;
}

const writeJsonFile = ({ writeJson, ensureDir }: Dependencies) => async (filePath: string, content: JsonValue, options?: WriteOptions | BufferEncoding) => {
  await ensureDir(path.dirname(filePath), { mode: 0o755 });

  const resolvedOptions = typeof options === "string"
    ? {
      encoding: options,
    }
    : options;

  await writeJson(filePath, content, {
    encoding: "utf-8",
    spaces: 2,
    ...resolvedOptions,
  });
};

const writeJsonFileInjectable = getInjectable({
  instantiate: (di) => {
    const { writeJson, ensureDir } = di.inject(fsInjectable);

    return writeJsonFile({
      writeJson,
      ensureDir,
    });
  },

  lifecycle: lifecycleEnum.singleton,
});

export default writeJsonFileInjectable;
