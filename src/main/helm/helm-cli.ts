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

import packageInfo from "../../../package.json";
import path from "path";
import { LensBinary, LensBinaryOpts } from "../lens-binary";
import { isProduction } from "../../common/vars";

export class HelmCli extends LensBinary {

  public constructor(baseDir: string, version: string) {
    const opts: LensBinaryOpts = {
      version,
      baseDir,
      originalBinaryName: "helm",
      newBinaryName: "helm3",
    };

    super(opts);
  }

  protected getTarName(): string | null {
    return `${this.binaryName}-v${this.binaryVersion}-${this.platformName}-${this.arch}.tar.gz`;
  }

  protected getUrl() {
    return `https://get.helm.sh/helm-v${this.binaryVersion}-${this.platformName}-${this.arch}.tar.gz`;
  }

  protected getBinaryPath() {
    return path.join(this.dirname, this.binaryName);
  }

  protected getOriginalBinaryPath() {
    return path.join(this.dirname, `${this.platformName}-${this.arch}`, this.originalBinaryName);
  }
}

const helmVersion = packageInfo.config.bundledHelmVersion;
let baseDir = process.resourcesPath;

if (!isProduction) {
  baseDir = path.join(process.cwd(), "binaries", "client", process.arch);
}

export const helmCli = new HelmCli(baseDir, helmVersion);

