#!/usr/bin/env node
/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { FileHandle, readFile } from "fs/promises";
import type { WriteStream } from "fs";
import { constants } from "fs";
import { open, mkdir, unlink } from "fs/promises";
import path from "path";
import { promisify } from "util";
import { pipeline as _pipeline, Transform, Writable } from "stream";
import type { SingleBar } from "cli-progress";
import { MultiBar } from "cli-progress";
import { extract } from "tar-stream";
import gunzip from "gunzip-maybe";
import fetch from "node-fetch"
import z from "zod";
import arg from "arg";
import { arch } from "process";

const options = arg({
  "--package": String,
  "--base-dir": String,
});

type Options = typeof options;

const assertOption = <Key extends keyof Options>(key: Key): NonNullable<Options[Key]> => {
  const raw = options[key];

  if (raw === undefined) {
    console.error(`missing ${key} option`);
    process.exit(1);
  }

  return raw;
};

const joinWithInitCwd = (relativePath: string): string => {
  const { INIT_CWD } = process.env;

  if (!INIT_CWD) {
    return relativePath;
  }

  return path.join(INIT_CWD, relativePath);
};

const pathToPackage = joinWithInitCwd(assertOption("--package"));
const pathToBaseDir = joinWithInitCwd(assertOption("--base-dir"));

function setTimeoutFor(controller: AbortController, timeout: number): void {
  const handle = setTimeout(() => controller.abort(), timeout);

  controller.signal.addEventListener("abort", () => clearTimeout(handle));
}

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

    setTimeoutFor(controller, 15 * 60 * 1000);

    const stream = await fetch(this.url, {
      signal: controller.signal,
    });
    const total = Number(stream.headers.get("content-length"));
    const bar = this.bar;
    let fileHandle: FileHandle | undefined = undefined;

    if (isNaN(total)) {
      throw new Error("no content-length header was present");
    }

    bar.setTotal(total);

    await mkdir(path.dirname(this.target), {
      mode: 0o755,
      recursive: true,
    });

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

      if ((error as any)?.code === "EEXIST") {
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

const PackageInfo = z.object({
  config: z.object({
    k8sProxyVersion: z.string().min(1),
    bundledKubectlVersion: z.string().min(1),
    bundledHelmVersion: z.string().min(1),
  })
})

const packageInfoRaw = await readFile(pathToPackage, "utf-8");
const packageInfo = PackageInfo.parse(JSON.parse(packageInfoRaw));

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

const downloaders: BinaryDownloader[] = [];

const downloadX64Binaries = () => {
  downloaders.push(
    new LensK8sProxyDownloader({
      version: packageInfo.config.k8sProxyVersion,
      platform: normalizedPlatform,
      downloadArch: "amd64",
      fileArch: "x64",
      baseDir: pathToBaseDir,
    }, multiBar),
    new KubectlDownloader({
      version: packageInfo.config.bundledKubectlVersion,
      platform: normalizedPlatform,
      downloadArch: "amd64",
      fileArch: "x64",
      baseDir: pathToBaseDir,
    }, multiBar),
    new HelmDownloader({
      version: packageInfo.config.bundledHelmVersion,
      platform: normalizedPlatform,
      downloadArch: "amd64",
      fileArch: "x64",
      baseDir: pathToBaseDir,
    }, multiBar),
  );
}

const downloadArm64Binaries = () => {
  downloaders.push(
    new LensK8sProxyDownloader({
      version: packageInfo.config.k8sProxyVersion,
      platform: normalizedPlatform,
      downloadArch: "arm64",
      fileArch: "arm64",
      baseDir: pathToBaseDir,
    }, multiBar),
    new KubectlDownloader({
      version: packageInfo.config.bundledKubectlVersion,
      platform: normalizedPlatform,
      downloadArch: "arm64",
      fileArch: "arm64",
      baseDir: pathToBaseDir,
    }, multiBar),
    new HelmDownloader({
      version: packageInfo.config.bundledHelmVersion,
      platform: normalizedPlatform,
      downloadArch: "arm64",
      fileArch: "arm64",
      baseDir: pathToBaseDir,
    }, multiBar),
  );
}

if (process.env.DOWNLOAD_ALL_ARCHITECTURES === "true") {
  downloadX64Binaries();
  downloadArm64Binaries();
} else if (arch === "x64") {
  downloadX64Binaries();
} else if (arch === "arm64") {
  downloadArm64Binaries();
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
