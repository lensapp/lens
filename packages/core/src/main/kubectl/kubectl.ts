/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import fs from "fs";
import { ensureDir, pathExists } from "fs-extra";
import * as lockFile from "proper-lockfile";
import { SemVer, coerce } from "semver";
import got from "got/dist/source";
import { promisify } from "util";
import stream from "stream";
import { noop } from "lodash/fp";
import type { JoinPaths } from "../../common/path/join-paths.injectable";
import type { GetDirnameOfPath } from "../../common/path/get-dirname.injectable";
import type { GetBasenameOfPath } from "../../common/path/get-basename.injectable";
import type { NormalizedPlatform } from "../../common/vars/normalized-platform.injectable";
import type { Logger } from "@k8slens/logger";
import type { ExecFile } from "../../common/fs/exec-file.injectable";
import { hasTypedProperty, isObject, isString, json } from "@k8slens/utilities";
import type { Unlink } from "../../common/fs/unlink.injectable";
import { packageMirrors, defaultPackageMirror } from "../../features/user-preferences/common/preferences-helpers";

const initScriptVersionString = "# lens-initscript v3";

export interface KubectlDependencies {
  readonly directoryForKubectlBinaries: string;
  readonly normalizedDownloadPlatform: NormalizedPlatform;
  readonly normalizedDownloadArch: "amd64" | "arm64" | "386";
  readonly kubectlBinaryName: string;
  readonly bundledKubectlBinaryPath: string;
  readonly baseBundledBinariesDirectory: string;
  readonly state: {
    readonly kubectlBinariesPath?: string;
    readonly downloadBinariesPath?: string;
    readonly downloadKubectlBinaries: boolean;
    readonly downloadMirror: string;
  };
  readonly bundledKubectlVersion: string;
  readonly kubectlVersionMap: Map<string, string>;
  readonly logger: Logger;
  joinPaths: JoinPaths;
  getDirnameOfPath: GetDirnameOfPath;
  getBasenameOfPath: GetBasenameOfPath;
  execFile: ExecFile;
  unlink: Unlink;
}

export class Kubectl {
  public readonly kubectlVersion: string;
  protected readonly url: string;
  protected readonly path: string;
  protected readonly dirname: string;

  public static invalidBundle = false;

  constructor(protected readonly dependencies: KubectlDependencies, clusterVersion: string) {
    let version: SemVer;
    const bundledVersion = new SemVer(this.dependencies.bundledKubectlVersion);

    try {
      version = new SemVer(clusterVersion);
    } catch {
      version = bundledVersion;
    }

    const fromMajorMinor = this.dependencies.kubectlVersionMap.get(`${version.major}.${version.minor}`);

    /**
     * minorVersion is the first two digits of kube server version if the version map includes that,
     * use that version, if not, fallback to the exact x.y.z of kube version
     */
    if (fromMajorMinor) {
      this.kubectlVersion = fromMajorMinor;
      this.dependencies.logger.debug(`Set kubectl version ${this.kubectlVersion} for cluster version ${clusterVersion} using version map`);
    } else {
      /* this is the version (without possible prelease tag) to get from the download mirror */
      const ver = coerce(version.format()) ?? bundledVersion;

      this.kubectlVersion = ver.format();
      this.dependencies.logger.debug(`Set kubectl version ${this.kubectlVersion} for cluster version ${clusterVersion} using fallback`);
    }

    this.url = `${this.getDownloadMirror()}/v${this.kubectlVersion}/bin/${this.dependencies.normalizedDownloadPlatform}/${this.dependencies.normalizedDownloadArch}/${this.dependencies.kubectlBinaryName}`;
    this.dirname = this.dependencies.joinPaths(this.getDownloadDir(), this.kubectlVersion);
    this.path = this.dependencies.joinPaths(this.dirname, this.dependencies.kubectlBinaryName);
  }

  public getBundledPath() {
    return this.dependencies.bundledKubectlBinaryPath;
  }

  public getPathFromPreferences() {
    return this.dependencies.state.kubectlBinariesPath || this.getBundledPath();
  }

  protected getDownloadDir() {
    if (this.dependencies.state.downloadBinariesPath) {
      return this.dependencies.joinPaths(this.dependencies.state.downloadBinariesPath, "kubectl");
    }

    return this.dependencies.directoryForKubectlBinaries;
  }

  public getPath = async (bundled = false): Promise<string> => {
    if (bundled) {
      return this.getBundledPath();
    }

    if (this.dependencies.state.downloadKubectlBinaries === false) {
      return this.getPathFromPreferences();
    }

    // return binary name if bundled path is not functional
    if (!await this.checkBinary(this.getBundledPath(), false)) {
      Kubectl.invalidBundle = true;

      return this.dependencies.getBasenameOfPath(this.getBundledPath());
    }

    try {
      if (!await this.ensureKubectl()) {
        this.dependencies.logger.error("Failed to ensure kubectl, fallback to the bundled version");

        return this.getBundledPath();
      }

      return this.path;
    } catch (err) {
      this.dependencies.logger.error("Failed to ensure kubectl, fallback to the bundled version", err);

      return this.getBundledPath();
    }
  };

  public async binDir() {
    try {
      await this.ensureKubectl();
      await this.writeInitScripts();

      return this.dirname;
    } catch (err) {
      this.dependencies.logger.error("Failed to get biniary directory", err);

      return "";
    }
  }

  public async checkBinary(path: string, checkVersion = true) {
    const exists = await pathExists(path);

    if (!exists) {
      return false;
    }

    const args = [
      "version",
      "--client",
      "--output", "json",
    ];
    const execResult = await this.dependencies.execFile(path, args);

    if (!execResult.callWasSuccessful) {
      this.dependencies.logger.error(`Local kubectl failed to run properly (${execResult.error}), unlinking`);
      await this.dependencies.unlink(this.path);

      return;
    }

    const parseResult = json.parse(execResult.response);

    if (!parseResult.callWasSuccessful) {
      this.dependencies.logger.error(`Local kubectl failed to run properly (${parseResult.error}), unlinking`);
      await this.dependencies.unlink(this.path);

      return;
    }

    if (!checkVersion) {
      return true;
    }

    const { response: output } = parseResult;

    if (
      !isObject(output)
      || !hasTypedProperty(output, "clientVersion", isObject)
      || !hasTypedProperty(output.clientVersion, "gitVersion", isString)
    ) {
      this.dependencies.logger.error(`Local kubectl failed to return correct shaped response, unlinking`);
      await this.dependencies.unlink(this.path);

      return;
    }

    const version = output.clientVersion.gitVersion;

    switch (output.clientVersion.gitVersion) {
      case this.kubectlVersion:
      case `v${this.kubectlVersion}`:
        this.dependencies.logger.debug(`Local kubectl is version ${this.kubectlVersion}`);

        return true;
      default:
        this.dependencies.logger.error(`Local kubectl is version ${version}, expected ${this.kubectlVersion}, unlinking`);
        await this.dependencies.unlink(this.path);

        return false;
    }
  }

  protected async checkBundled(): Promise<boolean> {
    if (this.kubectlVersion === this.dependencies.bundledKubectlVersion) {
      try {
        const exist = await pathExists(this.path);

        if (!exist) {
          await fs.promises.copyFile(this.getBundledPath(), this.path);
          await fs.promises.chmod(this.path, 0o755);
        }

        return true;
      } catch (err) {
        this.dependencies.logger.error(`Could not copy the bundled kubectl to app-data: ${err}`);

        return false;
      }
    } else {
      return false;
    }
  }

  public async ensureKubectl(): Promise<boolean> {
    if (this.dependencies.state.downloadKubectlBinaries === false) {
      return true;
    }

    if (Kubectl.invalidBundle) {
      this.dependencies.logger.error(`Detected invalid bundle binary, returning ...`);

      return false;
    }

    await ensureDir(this.dirname, 0o755);

    try {
      const release = await lockFile.lock(this.dirname);

      this.dependencies.logger.debug(`Acquired a lock for ${this.kubectlVersion}`);
      const bundled = await this.checkBundled();
      let isValid = await this.checkBinary(this.path, !bundled);

      if (!isValid && !bundled) {
        try {
          await this.downloadKubectl();
        } catch (error) {
          this.dependencies.logger.error(`[KUBECTL]: failed to download kubectl`, error);
          this.dependencies.logger.debug(`[KUBECTL]: Releasing lock for ${this.kubectlVersion}`);
          await release();

          return false;
        }

        isValid = await this.checkBinary(this.path, false);
      }

      if (!isValid) {
        this.dependencies.logger.debug(`[KUBECTL]: Releasing lock for ${this.kubectlVersion}`);
        await release();

        return false;
      }

      this.dependencies.logger.debug(`[KUBECTL]: Releasing lock for ${this.kubectlVersion}`);
      await release();

      return true;
    } catch (error) {
      this.dependencies.logger.error(`[KUBECTL]: Failed to get a lock for ${this.kubectlVersion}`, error);

      return false;
    }
  }

  public async downloadKubectl() {
    await ensureDir(this.dependencies.getDirnameOfPath(this.path), 0o755);

    this.dependencies.logger.info(`Downloading kubectl ${this.kubectlVersion} from ${this.url} to ${this.path}`);

    const downloadStream = got.stream({ url: this.url, decompress: true });
    const fileWriteStream = fs.createWriteStream(this.path, { mode: 0o755 });
    const pipeline = promisify(stream.pipeline);

    try {
      await pipeline(downloadStream, fileWriteStream);
      await fs.promises.chmod(this.path, 0o755);
      this.dependencies.logger.debug("kubectl binary download finished");
    } catch (error) {
      await this.dependencies.unlink(this.path).catch(noop);
      throw error;
    }
  }

  protected async writeInitScripts() {
    const binariesDir = this.dependencies.baseBundledBinariesDirectory;
    const kubectlPath = this.dependencies.state.downloadKubectlBinaries
      ? this.dirname
      : this.dependencies.getDirnameOfPath(this.getPathFromPreferences());

    const bashScriptPath = this.dependencies.joinPaths(this.dirname, ".bash_set_path");
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

    const zshScriptPath = this.dependencies.joinPaths(this.dirname, ".zlogin");
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

    const { url } = packageMirrors.get(this.dependencies.state.downloadMirror)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ?? packageMirrors.get(defaultPackageMirror)!;

    return url;
  }
}
