/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import packageInfo from "../package.json";
import fs from "fs";
import request from "request";
import { ensureDir, pathExists } from "fs-extra";
import path from "path";
import { noop } from "lodash";
import { isLinux, isMac } from "../src/common/vars";

class K8sProxyDownloader {
  public version: string;
  protected url: string;
  protected path: string;
  protected dirname: string;

  constructor(version: string, platform: string, arch: string, target: string) {
    this.version = version;
    this.url = `https://github.com/lensapp/lens-k8s-proxy/releases/download/v${this.version}/lens-k8s-proxy-${platform}-${arch}`;
    this.dirname = path.dirname(target);
    this.path = target;
  }

  public async checkBinary() {
    const exists = await pathExists(this.path);

    if (exists) {
      return true;
    }

    return false;
  }

  public async download() {
    if (await this.checkBinary()) {
      return console.log("Already exists");
    }

    await ensureDir(path.dirname(this.path), 0o755);

    const file = fs.createWriteStream(this.path);

    console.log(`Downloading lens-k8s-proxy ${this.version} from ${this.url} to ${this.path}`);
    const requestOpts: request.UriOptions & request.CoreOptions = {
      uri: this.url,
      gzip: true,
      followAllRedirects: true,
    };
    const stream = request(requestOpts);

    stream.on("complete", () => {
      console.log("lens-k8s-proxy binary download finished");
      file.end(noop);
    });

    stream.on("error", (error) => {
      console.log(error);
      fs.unlink(this.path, noop);
      throw error;
    });

    return new Promise<void>((resolve, reject) => {
      file.on("close", () => {
        console.log("lens-k8s-proxy binary download closed");
        fs.chmod(this.path, 0o755, (err) => {
          if (err) reject(err);
        });
        resolve();
      });
      stream.pipe(file);
    });
  }
}
const downloadVersion = packageInfo.config.k8sProxyVersion;
const baseDir = path.join(__dirname, "..", "binaries", "client");

const downloads = [];

if (isMac) {
  downloads.push({ platform: "darwin", arch: "amd64", target: path.join(baseDir, "darwin", "x64", "lens-k8s-proxy") });
  downloads.push({ platform: "darwin", arch: "arm64", target: path.join(baseDir, "darwin", "arm64", "lens-k8s-proxy") });
} else if (isLinux) {
  downloads.push({ platform: "linux", arch: "amd64", target: path.join(baseDir, "linux", "x64", "lens-k8s-proxy") });
  downloads.push({ platform: "linux", arch: "arm64", target: path.join(baseDir, "linux", "arm64", "lens-k8s-proxy") });
} else {
  downloads.push({ platform: "windows", arch: "amd64", target: path.join(baseDir, "windows", "x64", "lens-k8s-proxy.exe") });
  downloads.push({ platform: "windows", arch: "386", target: path.join(baseDir, "windows", "ia32", "lens-k8s-proxy.exe") });
}

downloads.forEach((dlOpts) => {
  console.log(dlOpts);
  const downloader = new K8sProxyDownloader(downloadVersion, dlOpts.platform, dlOpts.arch, dlOpts.target);

  console.log(`Downloading: ${JSON.stringify(dlOpts)}`);
  downloader.download().then(() => downloader.checkBinary().then(() => console.log("Download complete")));
});
