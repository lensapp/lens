/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import type { KubeConfig } from "@kubernetes/client-node";
import fs from "fs";
import tempy from "tempy";
import * as lockFile from "proper-lockfile";
import YAML from "json-to-pretty-yaml";
import { noop } from "../../utils";

export async function saveKubeconfig(config: KubeConfig, path: string) {
  const tmpFilePath = tempy.file();

  try {
    const release = await lockFile.lock(path);
    const contents = YAML.stringify(JSON.parse(config.exportConfig()));

    await fs.promises.writeFile(tmpFilePath, contents);
    await fs.promises.rename(tmpFilePath, path);
    release();
  } catch (e) {
    await fs.unlink(tmpFilePath, noop);
    throw new Error(`Failed to acquire lock file.\n${e}`);
  }
}
