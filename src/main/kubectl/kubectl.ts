/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import path from "path";
import fs from "fs";
import { promiseExecFile } from "../../common/utils/promise-exec";
import logger from "../logger";
import { ensureDir, pathExists } from "fs-extra";
import * as lockFile from "proper-lockfile";
import { getBundledKubectlVersion } from "../../common/utils/app-version";
import { SemVer } from "semver";
import { defaultPackageMirror, packageMirrors } from "../../common/user-store/preferences-helpers";
import got from "got/dist/source";
import { promisify } from "util";
import stream from "stream";
import { noop } from "lodash/fp";

const bundledVersion = getBundledKubectlVersion();
const kubectlMap: Map<string, string> = new Map([
  ["1.7", "1.8.15"],
  ["1.8", "1.9.10"],
  ["1.9", "1.10.13"],
  ["1.10", "1.11.10"],
  ["1.11", "1.12.10"],
  ["1.12", "1.13.12"],
  ["1.13", "1.13.12"],
  ["1.14", "1.14.10"],
  ["1.15", "1.15.11"],
  ["1.16", "1.16.15"],
  ["1.17", "1.17.17"],
  ["1.18", "1.18.20"],
  ["1.19", "1.19.12"],
  ["1.20", "1.20.8"],
  ["1.21", "1.21.9"],
  ["1.22", "1.22.6"],
  ["1.23", bundledVersion],
]);
const initScriptVersionString = "# lens-initscript v3";

export interface KubectlDependencies {
  readonly directoryForKubectlBinaries: string;
  readonly normalizedDownloadPlatform: "darwin" | "linux" | "windows";
  readonly normalizedDownloadArch: "amd64" | "arm64" | "386";
  readonly kubectlBinaryName: string;
  readonly bundledKubectlBinaryPath: string;
  readonly baseBundeledBinariesDirectory: string;
  readonly userStore: {
    readonly kubectlBinariesPath?: string;
    readonly downloadBinariesPath?: string;
    readonly downloadKubectlBinaries: boolean;
    readonly downloadMirror: string;
  };
}

export class Kubectl {
  public readonly kubectlVersion: string;
  protected readonly url: string;
  protected readonly path: string;
  protected readonly dirname: string;

  public static readonly bundledKubectlVersion = bundledVersion;
  public static invalidBundle = false;

  constructor(protected readonly dependencies: KubectlDependencies, clusterVersion: string) {
    let version: SemVer;

    try {
      version = new SemVer(clusterVersion, { includePrerelease: false });
    } catch {
      version = new SemVer(Kubectl.bundledKubectlVersion);
    }

    const fromMajorMinor = kubectlMap.get(`${version.major}.${version.minor}`);

    /**
     * minorVersion is the first two digits of kube server version if the version map includes that,
     * use that version, if not, fallback to the exact x.y.z of kube version
     */
    if (fromMajorMinor) {
      this.kubectlVersion = fromMajorMinor;
      logger.debug(`Set kubectl version ${this.kubectlVersion} for cluster version ${clusterVersion} using version map`);
    } else {
      this.kubectlVersion = version.format();
      logger.debug(`Set kubectl version ${this.kubectlVersion} for cluster version ${clusterVersion} using fallback`);
    }

    this.url = `${this.getDownloadMirror()}/v${this.kubectlVersion}/bin/${this.dependencies.normalizedDownloadPlatform}/${this.dependencies.normalizedDownloadArch}/${this.dependencies.kubectlBinaryName}`;
    this.dirname = path.normalize(path.join(this.getDownloadDir(), this.kubectlVersion));
    this.path = path.join(this.dirname, this.dependencies.kubectlBinaryName);
  }

  public getBundledPath() {
    return this.dependencies.bundledKubectlBinaryPath;
  }

  public getPathFromPreferences() {
    return this.dependencies.userStore.kubectlBinariesPath || this.getBundledPath();
  }

  protected getDownloadDir() {
    if (this.dependencies.userStore.downloadBinariesPath) {
      return path.join(this.dependencies.userStore.downloadBinariesPath, "kubectl");
    }

    return this.dependencies.directoryForKubectlBinaries;
  }

  public getPath = async (bundled = false): Promise<string> => {
    if (bundled) {
      return this.getBundledPath();
    }

    if (this.dependencies.userStore.downloadKubectlBinaries === false) {
      return this.getPathFromPreferences();
    }

    // return binary name if bundled path is not functional
    if (!await this.checkBinary(this.getBundledPath(), false)) {
      Kubectl.invalidBundle = true;

      return path.basename(this.getBundledPath());
    }

    try {
      if (!await this.ensureKubectl()) {
        logger.error("Failed to ensure kubectl, fallback to the bundled version");

        return this.getBundledPath();
      }

      return this.path;
    } catch (err) {
      logger.error("Failed to ensure kubectl, fallback to the bundled version", err);

      return this.getBundledPath();
    }
  };

  public async binDir() {
    try {
      await this.ensureKubectl();
      await this.writeInitScripts();

      return this.dirname;
    } catch (err) {
      logger.error("Failed to get biniary directory", err);

      return "";
    }
  }

  public async checkBinary(path: string, checkVersion = true) {
    const exists = await pathExists(path);

    if (exists) {
      try {
        const args = [
          "version",
          "--client",
          "--output", "json",
        ];
        const { stdout } = await promiseExecFile(path, args);
        const output = JSON.parse(stdout);

        if (!checkVersion) {
          return true;
        }
        let version: string = output.clientVersion.gitVersion;

        if (version[0] === "v") {
          version = version.slice(1);
        }

        if (version === this.kubectlVersion) {
          logger.debug(`Local kubectl is version ${this.kubectlVersion}`);

          return true;
        }
        logger.error(`Local kubectl is version ${version}, expected ${this.kubectlVersion}, unlinking`);
      } catch (error) {
        logger.error(`Local kubectl failed to run properly (${error}), unlinking`);
      }
      await fs.promises.unlink(this.path);
    }

    return false;
  }

  protected async checkBundled(): Promise<boolean> {
    if (this.kubectlVersion === Kubectl.bundledKubectlVersion) {
      try {
        const exist = await pathExists(this.path);

        if (!exist) {
          await fs.promises.copyFile(this.getBundledPath(), this.path);
          await fs.promises.chmod(this.path, 0o755);
        }

        return true;
      } catch (err) {
        logger.error(`Could not copy the bundled kubectl to app-data: ${err}`);

        return false;
      }
    } else {
      return false;
    }
  }

  public async ensureKubectl(): Promise<boolean> {
    if (this.dependencies.userStore.downloadKubectlBinaries === false) {
      return true;
    }

    if (Kubectl.invalidBundle) {
      logger.error(`Detected invalid bundle binary, returning ...`);

      return false;
    }

    await ensureDir(this.dirname, 0o755);

    try {
      const release = await lockFile.lock(this.dirname);

      logger.debug(`Acquired a lock for ${this.kubectlVersion}`);
      const bundled = await this.checkBundled();
      let isValid = await this.checkBinary(this.path, !bundled);

      if (!isValid && !bundled) {
        try {
          await this.downloadKubectl();
        } catch (error) {
          logger.error(`[KUBECTL]: failed to download kubectl`, error);
          logger.debug(`[KUBECTL]: Releasing lock for ${this.kubectlVersion}`);
          await release();

          return false;
        }

        isValid = await this.checkBinary(this.path, false);
      }

      if (!isValid) {
        logger.debug(`[KUBECTL]: Releasing lock for ${this.kubectlVersion}`);
        await release();

        return false;
      }

      logger.debug(`[KUBECTL]: Releasing lock for ${this.kubectlVersion}`);
      await release();

      return true;
    } catch (error) {
      logger.error(`[KUBECTL]: Failed to get a lock for ${this.kubectlVersion}`, error);

      return false;
    }
  }

  public async downloadKubectl() {
    await ensureDir(path.dirname(this.path), 0o755);

    logger.info(`Downloading kubectl ${this.kubectlVersion} from ${this.url} to ${this.path}`);

    const downloadStream = got.stream({ url: this.url, decompress: true });
    const fileWriteStream = fs.createWriteStream(this.path, { mode: 0o755 });
    const pipeline = promisify(stream.pipeline);

    try {
      await pipeline(downloadStream, fileWriteStream);
      await fs.promises.chmod(this.path, 0o755);
      logger.debug("kubectl binary download finished");
    } catch (error) {
      await fs.promises.unlink(this.path).catch(noop);
      throw error;
    }
  }

  protected async writeInitScripts() {
    const binariesDir = this.dependencies.baseBundeledBinariesDirectory;
    const kubectlPath = this.dependencies.userStore.downloadKubectlBinaries
      ? this.dirname
      : path.dirname(this.getPathFromPreferences());

    const bashScriptPath = path.join(this.dirname, ".bash_set_path");
    const bashScript = [
      initScriptVersionString,
      "tempkubeconfig=\"$KUBECONFIG\"",
      "test -f \"/etc/profile\" && . \"/etc/profile\"",
      "if test -f \"$HOME/.bash_profile\"; then",
      "  . \"$HOME/.bash_profile\"",
      "elif test -f \"$HOME/.bash_login\"; then",
      "  . \"$HOME/.bash_login\"",
      "elif test -f \"$HOME/.profile\"; then",
      "  . \"$HOME/.profile\"",
      "fi",
      `export PATH="${kubectlPath}:${binariesDir}:$PATH"`,
      'export KUBECONFIG="$tempkubeconfig"',
      `NO_PROXY=",\${NO_PROXY:-localhost},"`,
      `NO_PROXY="\${NO_PROXY//,localhost,/,}"`,
      `NO_PROXY="\${NO_PROXY//,127.0.0.1,/,}"`,
      `NO_PROXY="localhost,127.0.0.1\${NO_PROXY%,}"`,
      "export NO_PROXY",
      "unset tempkubeconfig",
    ].join("\n");

    const zshScriptPath = path.join(this.dirname, ".zlogin");
    const zshScript = [
      initScriptVersionString,
      "tempkubeconfig=\"$KUBECONFIG\"",

      // restore previous ZDOTDIR
      "export ZDOTDIR=\"$OLD_ZDOTDIR\"",

      // source all the files
      "test -f \"$OLD_ZDOTDIR/.zshenv\" && . \"$OLD_ZDOTDIR/.zshenv\"",
      "test -f \"$OLD_ZDOTDIR/.zprofile\" && . \"$OLD_ZDOTDIR/.zprofile\"",
      "test -f \"$OLD_ZDOTDIR/.zlogin\" && . \"$OLD_ZDOTDIR/.zlogin\"",
      "test -f \"$OLD_ZDOTDIR/.zshrc\" && . \"$OLD_ZDOTDIR/.zshrc\"",

      // voodoo to replace any previous occurrences of kubectl path in the PATH
      `kubectlpath="${kubectlPath}"`,
      `binariesDir="${binariesDir}"`,
      "p=\":$kubectlpath:\"",
      "d=\":$PATH:\"",
      `d=\${d//$p/:}`,
      `d=\${d/#:/}`,
      `export PATH="$kubectlpath:$binariesDir:\${d/%:/}"`,
      "export KUBECONFIG=\"$tempkubeconfig\"",
      `NO_PROXY=",\${NO_PROXY:-localhost},"`,
      `NO_PROXY="\${NO_PROXY//,localhost,/,}"`,
      `NO_PROXY="\${NO_PROXY//,127.0.0.1,/,}"`,
      `NO_PROXY="localhost,127.0.0.1\${NO_PROXY%,}"`,
      "export NO_PROXY",
      "unset tempkubeconfig",
      "unset OLD_ZDOTDIR",
    ].join("\n");

    await Promise.all([
      fs.promises.writeFile(bashScriptPath, bashScript, { mode: 0o644 }),
      fs.promises.writeFile(zshScriptPath, zshScript, { mode: 0o644 }),
    ]);
  }

  protected getDownloadMirror(): string {
    // MacOS packages are only available from default

    const { url } = packageMirrors.get(this.dependencies.userStore.downloadMirror)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ?? packageMirrors.get(defaultPackageMirror)!;

    return url;
  }
}
