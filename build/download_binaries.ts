/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import packageInfo from "../package.json";
import type { FileHandle } from "fs/promises";
import { open } from "fs/promises";
import type { WriteStream } from "fs-extra";
import { constants, ensureDir, unlink } from "fs-extra";
import path from "path";
import fetch from "node-fetch";
import { promisify } from "util";
import { pipeline as _pipeline, Transform, Writable } from "stream";
import type { SingleBar } from "cli-progress";
import { MultiBar } from "cli-progress";
import AbortController from "abort-controller";
import { extract } from "tar-stream";
import gunzip from "gunzip-maybe";
import { getBinaryName, normalizedPlatform } from "../src/common/vars";
import { isErrnoException } from "../src/common/utils";

const pipeline = promisify(_pipeline);

interface BinaryDownloaderArgs {
  readonly version: string;
  readonly platform: SupportedPlatform;
  readonly downloadArch: string;
  readonly fileArch: string;
  readonly binaryName: string;
  readonly baseDir: string;
}

abstract class BinaryDownloader {
  protected abstract readonly url: string;
  protected readonly bar: SingleBar;
  protected readonly target: string;

  protected getTransformStreams(file: Writable): (NodeJS.ReadWriteStream | NodeJS.WritableStream)[] {
    return [file];
  }

  constructor(public readonly args: BinaryDownloaderArgs, multiBar: MultiBar) {
    this.bar = multiBar.create(1, 0, args);
    this.target = path.join(args.baseDir, args.platform, args.fileArch, args.binaryName);
  }

  async ensureBinary(): Promise<void> {
    if (process.env.LENS_SKIP_DOWNLOAD_BINARIES === "true") {
      return;
    }

    const controller = new AbortController();
    const stream = await fetch(this.url, {
      timeout: 15 * 60 * 1000, // 15min
      signal: controller.signal,
    });
    const total = Number(stream.headers.get("content-length"));
    const bar = this.bar;
    let fileHandle: FileHandle | undefined = undefined;

    if (isNaN(total)) {
      throw new Error("no content-length header was present");
    }

    bar.setTotal(total);

    await ensureDir(path.dirname(this.target), 0o755);

    try {
      /**
       * This is necessary because for some reason `createWriteStream({ flags: "wx" })`
       * was throwing someplace else and not here
       */
      const handle = fileHandle = await open(this.target, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL);

      await pipeline(
        stream.body,
        new Transform({
          transform(chunk, encoding, callback) {
            bar.increment(chunk.length);
            this.push(chunk);
            callback();
          },
        }),
        ...this.getTransformStreams(new Writable({
          write(chunk, encoding, cb) {
            handle.write(chunk)
              .then(() => cb())
              .catch(cb);
          },
        })),
      );
      await fileHandle.chmod(0o755);
      await fileHandle.close();
    } catch (error) {
      await fileHandle?.close();

      if (isErrnoException(error) && error.code === "EEXIST") {
        bar.increment(total); // mark as finished
        controller.abort(); // stop trying to download
      } else {
        await unlink(this.target);
        throw error;
      }
    }
  }
}

class LensK8sProxyDownloader extends BinaryDownloader {
  protected readonly url: string;

  constructor(args: Omit<BinaryDownloaderArgs, "binaryName">, bar: MultiBar) {
    const binaryName = getBinaryName("lens-k8s-proxy", { forPlatform: args.platform });

    super({ ...args, binaryName }, bar);
    this.url = `https://github.com/lensapp/lens-k8s-proxy/releases/download/v${args.version}/lens-k8s-proxy-${args.platform}-${args.downloadArch}`;
  }
}

class KubectlDownloader extends BinaryDownloader {
  protected readonly url: string;

  constructor(args: Omit<BinaryDownloaderArgs, "binaryName">, bar: MultiBar) {
    const binaryName = getBinaryName("kubectl", { forPlatform: args.platform });

    super({ ...args, binaryName }, bar);
    this.url = `https://storage.googleapis.com/kubernetes-release/release/v${args.version}/bin/${args.platform}/${args.downloadArch}/${binaryName}`;
  }
}

class HelmDownloader extends BinaryDownloader {
  protected readonly url: string;

  constructor(args: Omit<BinaryDownloaderArgs, "binaryName">, bar: MultiBar) {
    const binaryName = getBinaryName("helm", { forPlatform: args.platform });

    super({ ...args, binaryName }, bar);
    this.url = `https://get.helm.sh/helm-v${args.version}-${args.platform}-${args.downloadArch}.tar.gz`;
  }

  protected getTransformStreams(file: WriteStream) {
    const extracting = extract({
      allowUnknownFormat: false,
    });

    extracting.on("entry", (headers, stream, next) => {
      if (headers.name.endsWith(this.args.binaryName)) {
        stream
          .pipe(file)
          .once("finish", () => next())
          .once("error", next);
      } else {
        stream.resume();
        next();
      }
    });

    return [gunzip(3), extracting];
  }
}

type SupportedPlatform = "darwin" | "linux" | "windows";

async function main() {
  const multiBar = new MultiBar({
    align: "left",
    clearOnComplete: false,
    hideCursor: true,
    autopadding: true,
    noTTYOutput: true,
    format: "[{bar}] {percentage}% | {downloadArch} {binaryName}",
  });
  const baseDir = path.join(__dirname, "..", "binaries", "client");
  const downloaders: BinaryDownloader[] = [
    new LensK8sProxyDownloader({
      version: packageInfo.config.k8sProxyVersion,
      platform: normalizedPlatform,
      downloadArch: "amd64",
      fileArch: "x64",
      baseDir,
    }, multiBar),
    new KubectlDownloader({
      version: packageInfo.config.bundledKubectlVersion,
      platform: normalizedPlatform,
      downloadArch: "amd64",
      fileArch: "x64",
      baseDir,
    }, multiBar),
    new HelmDownloader({
      version: packageInfo.config.bundledHelmVersion,
      platform: normalizedPlatform,
      downloadArch: "amd64",
      fileArch: "x64",
      baseDir,
    }, multiBar),
  ];

  if (normalizedPlatform === "darwin") {
    downloaders.push(
      new LensK8sProxyDownloader({
        version: packageInfo.config.k8sProxyVersion,
        platform: normalizedPlatform,
        downloadArch: "arm64",
        fileArch: "arm64",
        baseDir,
      }, multiBar),
      new KubectlDownloader({
        version: packageInfo.config.bundledKubectlVersion,
        platform: normalizedPlatform,
        downloadArch: "arm64",
        fileArch: "arm64",
        baseDir,
      }, multiBar),
      new HelmDownloader({
        version: packageInfo.config.bundledHelmVersion,
        platform: normalizedPlatform,
        downloadArch: "arm64",
        fileArch: "arm64",
        baseDir,
      }, multiBar),
    );
  }

  const settledResults = await Promise.allSettled(downloaders.map(downloader => (
    downloader.ensureBinary()
      .catch(error => {
        throw new Error(`Failed to download ${downloader.args.binaryName} for ${downloader.args.platform}/${downloader.args.downloadArch}: ${error}`);
      })
  )));

  multiBar.stop();
  const errorResult = settledResults.find(res => res.status === "rejected") as PromiseRejectedResult | undefined;

  if (errorResult) {
    console.error("234", String(errorResult.reason));
    process.exit(1);
  }

  process.exit(0);
}

main().catch(error => console.error("from main", error));
