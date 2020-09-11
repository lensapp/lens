import fs from "fs";
import fse from "fs-extra";
import got from "got/dist/source";
import md5File from "md5-file";
import path from "path";
import stream from "stream";
import util, { promisify } from "util";

import packageInfo from "../package.json";
import { GotStreamFunctionOptions } from "../src/common/got-opts";
import logger from "../src/main/logger";

const pipeline = promisify(stream.pipeline);

class KubectlDownloader {
  public kubectlVersion: string;
  protected url: string;
  protected path: string;
  protected dirname: string;

  constructor(clusterVersion: string, platform: string, arch: string, target: string) {
    this.kubectlVersion = clusterVersion;
    const binaryName = platform === "windows" ? "kubectl.exe" : "kubectl";

    this.url = `https://storage.googleapis.com/kubernetes-release/release/v${this.kubectlVersion}/bin/${platform}/${arch}/${binaryName}`;
    this.dirname = path.dirname(target);
    this.path = target;
  }

  protected async urlEtag() {
    try {
      const res = await got.head(this.url);
      const { etag } = res.headers;

      if (Array.isArray(etag)) {
        return etag[0].replace(/"/g, "");
      }

      if (typeof etag === "string") {
        return etag.replace(/"/g, "");
      }
    } catch (err) {
      logger.error("Failed to get etag:", err);
    }

    return "";
  }

  public async checkBinary() {
    const exists = await fse.pathExists(this.path);

    if (exists) {
      const hash = md5File.sync(this.path);
      const etag = await this.urlEtag();

      if(hash == etag) {
        console.log("Kubectl md5sum matches the remote etag");

        return true;
      }

      console.log(`Kubectl md5sum ${hash} does not match the remote etag ${etag}, unlinking and downloading again`);
      await fs.promises.unlink(this.path);
    }

    return false;
  }

  public async downloadKubectl(): Promise<void> {
    const exists = await this.checkBinary();

    if (exists) {
      return void console.log("Already exists and is valid");
    }

    await fse.ensureDir(path.dirname(this.path), 0o755);

    console.log(`Downloading kubectl ${this.kubectlVersion} from ${this.url} to ${this.path}`);
    const options: GotStreamFunctionOptions = {
      decompress: true,
      isStream: true,
    };

    try {
      // TODO: improve the UI for this to use some sort of loading bar TUI
      await pipeline(
        got.stream(this.url, options),
        fs.createWriteStream(this.path)
      );
      await fse.chmod(this.path, 0o755);
    } catch (err) {
      logger.error("Failed to download kubectl:", err);
    }
  }
}

const downloadVersion = packageInfo.config.bundledKubectlVersion;
const baseDir = path.join(process.env.INIT_CWD, "binaries", "client");

interface DownloadTarget {
  platform: string;
  target: string;
  arch: string;
}

const downloads: DownloadTarget[] = [
  { platform: "linux", arch: "amd64", target: path.join(baseDir, "linux", "x64", "kubectl") },
  { platform: "darwin", arch: "amd64", target: path.join(baseDir, "darwin", "x64", "kubectl") },
  { platform: "windows", arch: "amd64", target: path.join(baseDir, "windows", "x64", "kubectl.exe") },
  { platform: "windows", arch: "386", target: path.join(baseDir, "windows", "ia32", "kubectl.exe") }
];

async function downloadOne(opts: DownloadTarget) {
  const downloader = new KubectlDownloader(downloadVersion, opts.platform, opts.arch, opts.target);

  console.log(`Downloading: ${util.inspect(opts, false, null, true)}`);
  await downloader.downloadKubectl();
  await downloader.checkBinary();
  console.log(`Finished downloading for ${opts.platform}/${opts.arch}`);
}

Promise.all(downloads.map(downloadOne));
