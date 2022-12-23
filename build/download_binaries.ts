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
import type * as FetchModule from "node-fetch";
import { promisify } from "util";
import { pipeline as _pipeline, Transform, Writable } from "stream";
import type { SingleBar } from "cli-progress";
import { MultiBar } from "cli-progress";
import { extract } from "tar-stream";
import gunzip from "gunzip-maybe";
import { isErrnoException, setTimeoutFor } from "../src/common/utils";
import AbortController from "abort-controller";

type Response = FetchModule.Response;
type RequestInfo = FetchModule.RequestInfo;
type RequestInit = FetchModule.RequestInit;

const pipeline = promisify(_pipeline);

const getBinaryName = (binaryName: string, { forPlatform }: { forPlatform : string }) => {
  if (forPlatform === "windows") {
    return `${binaryName}.exe`;
  }

  return binaryName;
};

interface BinaryDownloaderArgs {
  readonly version: string;
  readonly platform: SupportedPlatform;
  readonly downloadArch: string;
  readonly fileArch: string;
  readonly binaryName: string;
  readonly baseDir: string;
}

interface BinaryDownloaderDependencies {
  fetch: (url: RequestInfo, init?: RequestInit) => Promise<Response>;
}

abstract class BinaryDownloader {
  protected abstract readonly url: string;
  protected readonly bar: SingleBar;
  protected readonly target: string;

  protected getTransformStreams(file: Writable): (NodeJS.ReadWriteStream | NodeJS.WritableStream)[] {
    return [file];
  }

  constructor(protected readonly dependencies: BinaryDownloaderDependencies, public readonly args: BinaryDownloaderArgs, multiBar: MultiBar) {
    this.bar = multiBar.create(1, 0, args);
    this.target = path.join(args.baseDir, args.platform, args.fileArch, args.binaryName);
  }

  async ensureBinary(): Promise<void> {
    if (process.env.LENS_SKIP_DOWNLOAD_BINARIES === "true") {
      return;
    }

    const controller = new AbortController();

    setTimeoutFor(controller, 15 * 60 * 1000);

    const stream = await this.dependencies.fetch(this.url, {
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

      if (!stream.body) {
        throw new Error("no body on stream");
      }

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

  constructor(deps: BinaryDownloaderDependencies, args: Omit<BinaryDownloaderArgs, "binaryName">, bar: MultiBar) {
    const binaryName = getBinaryName("lens-k8s-proxy", { forPlatform: args.platform });

    super(deps, { ...args, binaryName }, bar);
    this.url = `https://github.com/lensapp/lens-k8s-proxy/releases/download/v${args.version}/lens-k8s-proxy-${args.platform}-${args.downloadArch}`;
  }
}

class KubectlDownloader extends BinaryDownloader {
  protected readonly url: string;

  constructor(deps: BinaryDownloaderDependencies, args: Omit<BinaryDownloaderArgs, "binaryName">, bar: MultiBar) {
    const binaryName = getBinaryName("kubectl", { forPlatform: args.platform });

    super(deps, { ...args, binaryName }, bar);
    this.url = `https://storage.googleapis.com/kubernetes-release/release/v${args.version}/bin/${args.platform}/${args.downloadArch}/${binaryName}`;
  }
}

class HelmDownloader extends BinaryDownloader {
  protected readonly url: string;

  constructor(deps: BinaryDownloaderDependencies, args: Omit<BinaryDownloaderArgs, "binaryName">, bar: MultiBar) {
    const binaryName = getBinaryName("helm", { forPlatform: args.platform });

    super(deps, { ...args, binaryName }, bar);
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

const importFetchModule = new Function('return import("node-fetch")') as () => Promise<typeof FetchModule>;

async function main() {
  const deps: BinaryDownloaderDependencies = {
    fetch: (await importFetchModule()).default,
  };
  const normalizedPlatform = (() => {
    switch (process.platform) {
      case "darwin":
        return "darwin";
      case "linux":
        return "linux";
      case "win32":
        return "windows";
      default:
        throw new Error(`platform=${process.platform} is unsupported`);
    }
  })();
  const multiBar = new MultiBar({
    align: "left",
    clearOnComplete: false,
    hideCursor: true,
    autopadding: true,
    noTTYOutput: true,
    format: "[{bar}] {percentage}% | {downloadArch} {binaryName}",
  });
  const baseDir = path.join(process.cwd(), "binaries", "client");
  const downloaders: BinaryDownloader[] = [
    new LensK8sProxyDownloader(deps, {
      version: packageInfo.config.k8sProxyVersion,
      platform: normalizedPlatform,
      downloadArch: "amd64",
      fileArch: "x64",
      baseDir,
    }, multiBar),
    new KubectlDownloader(deps, {
      version: packageInfo.config.bundledKubectlVersion,
      platform: normalizedPlatform,
      downloadArch: "amd64",
      fileArch: "x64",
      baseDir,
    }, multiBar),
    new HelmDownloader(deps, {
      version: packageInfo.config.bundledHelmVersion,
      platform: normalizedPlatform,
      downloadArch: "amd64",
      fileArch: "x64",
      baseDir,
    }, multiBar),
  ];

  if (normalizedPlatform !== "windows") {
    downloaders.push(
      new LensK8sProxyDownloader(deps, {
        version: packageInfo.config.k8sProxyVersion,
        platform: normalizedPlatform,
        downloadArch: "arm64",
        fileArch: "arm64",
        baseDir,
      }, multiBar),
      new KubectlDownloader(deps, {
        version: packageInfo.config.bundledKubectlVersion,
        platform: normalizedPlatform,
        downloadArch: "arm64",
        fileArch: "arm64",
        baseDir,
      }, multiBar),
      new HelmDownloader(deps, {
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
