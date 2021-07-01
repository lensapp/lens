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

import { app, remote } from "electron";
import path from "path";
import fs from "fs";
import { promiseExec } from "./promise-exec";
import logger from "./logger";
import { ensureDir, pathExists } from "fs-extra";
import * as lockFile from "proper-lockfile";
import { helmCli } from "./helm/helm-cli";
import { UserStore } from "../common/user-store";
import { customRequest } from "../common/request";
import { getBundledKubectlVersion } from "../common/utils/app-version";
import { isDevelopment, isWindows, isTestEnv } from "../common/vars";
import { SemVer } from "semver";
import type { SelectOption } from "../renderer/components/select";

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
  ["1.18", bundledVersion],
  ["1.19", "1.19.7"],
  ["1.20", "1.20.2"],
  ["1.21", "1.21.1"]
]);
const packageMirrors: Map<string, string> = new Map([
  ["default", "https://storage.googleapis.com/kubernetes-release/release"],
  ["china", "https://mirror.azure.cn/kubernetes/kubectl"]
]);

export const downloadMirrorOptions: SelectOption<string>[] = [
  { value: "default", label: "Default (Google)" },
  { value: "china", label: "China (Azure)" },
];

let bundledPath: string;
const initScriptVersionString = "# lens-initscript v3\n";

export function bundledKubectlPath(): string {
  if (bundledPath) { return bundledPath; }

  if (isDevelopment || isTestEnv) {
    const platformName = isWindows ? "windows" : process.platform;

    bundledPath = path.join(process.cwd(), "binaries", "client", platformName, process.arch, "kubectl");
  } else {
    bundledPath = path.join(process.resourcesPath, process.arch, "kubectl");
  }

  if (isWindows) {
    bundledPath = `${bundledPath}.exe`;
  }

  return bundledPath;
}

export class Kubectl {
  public kubectlVersion: string;
  protected directory: string;
  protected url: string;
  protected path: string;
  protected dirname: string;

  static get kubectlDir() {
    return path.join((app || remote.app).getPath("userData"), "binaries", "kubectl");
  }

  public static readonly bundledKubectlVersion: string = bundledVersion;
  public static invalidBundle = false;
  private static bundledInstance: Kubectl;

  // Returns the single bundled Kubectl instance
  public static bundled() {
    return Kubectl.bundledInstance ??= new Kubectl(Kubectl.bundledKubectlVersion);
  }

  constructor(clusterVersion: string) {
    let version: SemVer;

    try {
      version = new SemVer(clusterVersion, { includePrerelease: false });
    } catch {
      version = new SemVer(Kubectl.bundledKubectlVersion);
    }

    const minorVersion = `${version.major}.${version.minor}`;

    /* minorVersion is the first two digits of kube server version
       if the version map includes that, use that version, if not, fallback to the exact x.y.z of kube version */
    if (kubectlMap.has(minorVersion)) {
      this.kubectlVersion = kubectlMap.get(minorVersion);
      logger.debug(`Set kubectl version ${this.kubectlVersion} for cluster version ${clusterVersion} using version map`);
    } else {
      this.kubectlVersion = version.format();
      logger.debug(`Set kubectl version ${this.kubectlVersion} for cluster version ${clusterVersion} using fallback`);
    }

    let arch = null;

    if (process.arch == "x64") {
      arch = "amd64";
    } else if (process.arch == "x86" || process.arch == "ia32") {
      arch = "386";
    } else {
      arch = process.arch;
    }

    const platformName = isWindows ? "windows" : process.platform;
    const binaryName = isWindows ? "kubectl.exe" : "kubectl";

    this.url = `${this.getDownloadMirror()}/v${this.kubectlVersion}/bin/${platformName}/${arch}/${binaryName}`;

    this.dirname = path.normalize(path.join(this.getDownloadDir(), this.kubectlVersion));
    this.path = path.join(this.dirname, binaryName);
  }

  public getBundledPath() {
    return bundledKubectlPath();
  }

  public getPathFromPreferences() {
    return UserStore.getInstance().kubectlBinariesPath || this.getBundledPath();
  }

  protected getDownloadDir() {
    if (UserStore.getInstance().downloadBinariesPath) {
      return path.join(UserStore.getInstance().downloadBinariesPath, "kubectl");
    }

    return Kubectl.kubectlDir;
  }

  public async getPath(bundled = false): Promise<string> {
    if (bundled) {
      return this.getBundledPath();
    }

    if (UserStore.getInstance().downloadKubectlBinaries === false) {
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
      logger.error("Failed to ensure kubectl, fallback to the bundled version");
      logger.error(err);

      return this.getBundledPath();
    }
  }

  public async binDir() {
    try {
      await this.ensureKubectl();
      await this.writeInitScripts();

      return this.dirname;
    } catch (err) {
      logger.error(err);

      return "";
    }
  }

  public async checkBinary(path: string, checkVersion = true) {
    const exists = await pathExists(path);

    if (exists) {
      try {
        const { stdout } = await promiseExec(`"${path}" version --client=true -o json`);
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
      } catch (err) {
        logger.error(`Local kubectl failed to run properly (${err.message}), unlinking`);
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
    if (UserStore.getInstance().downloadKubectlBinaries === false) {
      return true;
    }

    if (Kubectl.invalidBundle) {
      logger.error(`Detected invalid bundle binary, returning ...`);

      return false;
    }
    await ensureDir(this.dirname, 0o755);

    return lockFile.lock(this.dirname).then(async (release) => {
      logger.debug(`Acquired a lock for ${this.kubectlVersion}`);
      const bundled = await this.checkBundled();
      let isValid = await this.checkBinary(this.path, !bundled);

      if (!isValid && !bundled) {
        await this.downloadKubectl().catch((error) => {
          logger.error(error);
          logger.debug(`Releasing lock for ${this.kubectlVersion}`);
          release();

          return false;
        });
        isValid = !await this.checkBinary(this.path, false);
      }

      if (!isValid) {
        logger.debug(`Releasing lock for ${this.kubectlVersion}`);
        release();

        return false;
      }
      logger.debug(`Releasing lock for ${this.kubectlVersion}`);
      release();

      return true;
    }).catch((e) => {
      logger.error(`Failed to get a lock for ${this.kubectlVersion}`);
      logger.error(e);

      return false;
    });
  }

  public async downloadKubectl() {
    await ensureDir(path.dirname(this.path), 0o755);

    logger.info(`Downloading kubectl ${this.kubectlVersion} from ${this.url} to ${this.path}`);

    return new Promise<void>((resolve, reject) => {
      const stream = customRequest({
        url: this.url,
        gzip: true,
      });
      const file = fs.createWriteStream(this.path);

      stream.on("complete", () => {
        logger.debug("kubectl binary download finished");
        file.end();
      });
      stream.on("error", (error) => {
        logger.error(error);
        fs.unlink(this.path, () => {
          // do nothing
        });
        reject(error);
      });
      file.on("close", () => {
        logger.debug("kubectl binary download closed");
        fs.chmod(this.path, 0o755, (err) => {
          if (err) reject(err);
        });
        resolve();
      });
      stream.pipe(file);
    });
  }

  protected async writeInitScripts() {
    const kubectlPath = UserStore.getInstance().downloadKubectlBinaries ? this.dirname : path.dirname(this.getPathFromPreferences());
    const helmPath = helmCli.getBinaryDir();
    const fsPromises = fs.promises;
    const bashScriptPath = path.join(this.dirname, ".bash_set_path");
    let bashScript = `${initScriptVersionString}`;

    bashScript += "tempkubeconfig=\"$KUBECONFIG\"\n";
    bashScript += "test -f \"/etc/profile\" && . \"/etc/profile\"\n";
    bashScript += "if test -f \"$HOME/.bash_profile\"; then\n";
    bashScript += "  . \"$HOME/.bash_profile\"\n";
    bashScript += "elif test -f \"$HOME/.bash_login\"; then\n";
    bashScript += "  . \"$HOME/.bash_login\"\n";
    bashScript += "elif test -f \"$HOME/.profile\"; then\n";
    bashScript += "  . \"$HOME/.profile\"\n";
    bashScript += "fi\n";
    bashScript += `export PATH="${helmPath}:${kubectlPath}:$PATH"\n`;
    bashScript += "export KUBECONFIG=\"$tempkubeconfig\"\n";

    bashScript += "NO_PROXY=\",${NO_PROXY:-localhost},\"\n";
    bashScript += "NO_PROXY=\"${NO_PROXY//,localhost,/,}\"\n";
    bashScript += "NO_PROXY=\"${NO_PROXY//,127.0.0.1,/,}\"\n";
    bashScript += "NO_PROXY=\"localhost,127.0.0.1${NO_PROXY%,}\"\n";
    bashScript += "export NO_PROXY\n";
    bashScript += "unset tempkubeconfig\n";
    await fsPromises.writeFile(bashScriptPath, bashScript.toString(), { mode: 0o644 });

    const zshScriptPath = path.join(this.dirname, ".zlogin");
    let zshScript = `${initScriptVersionString}`;

    zshScript += "tempkubeconfig=\"$KUBECONFIG\"\n";
    // restore previous ZDOTDIR
    zshScript += "export ZDOTDIR=\"$OLD_ZDOTDIR\"\n";
    // source all the files
    zshScript += "test -f \"$OLD_ZDOTDIR/.zshenv\" && . \"$OLD_ZDOTDIR/.zshenv\"\n";
    zshScript += "test -f \"$OLD_ZDOTDIR/.zprofile\" && . \"$OLD_ZDOTDIR/.zprofile\"\n";
    zshScript += "test -f \"$OLD_ZDOTDIR/.zlogin\" && . \"$OLD_ZDOTDIR/.zlogin\"\n";
    zshScript += "test -f \"$OLD_ZDOTDIR/.zshrc\" && . \"$OLD_ZDOTDIR/.zshrc\"\n";

    // voodoo to replace any previous occurrences of kubectl path in the PATH
    zshScript += `kubectlpath=\"${kubectlPath}"\n`;
    zshScript += `helmpath=\"${helmPath}"\n`;
    zshScript += "p=\":$kubectlpath:\"\n";
    zshScript += "d=\":$PATH:\"\n";
    zshScript += "d=${d//$p/:}\n";
    zshScript += "d=${d/#:/}\n";
    zshScript += "export PATH=\"$helmpath:$kubectlpath:${d/%:/}\"\n";
    zshScript += "export KUBECONFIG=\"$tempkubeconfig\"\n";
    zshScript += "NO_PROXY=\",${NO_PROXY:-localhost},\"\n";
    zshScript += "NO_PROXY=\"${NO_PROXY//,localhost,/,}\"\n";
    zshScript += "NO_PROXY=\"${NO_PROXY//,127.0.0.1,/,}\"\n";
    zshScript += "NO_PROXY=\"localhost,127.0.0.1${NO_PROXY%,}\"\n";
    zshScript += "export NO_PROXY\n";
    zshScript += "unset tempkubeconfig\n";
    zshScript += "unset OLD_ZDOTDIR\n";
    await fsPromises.writeFile(zshScriptPath, zshScript.toString(), { mode: 0o644 });
  }

  protected getDownloadMirror() {
    const mirror = packageMirrors.get(UserStore.getInstance().downloadMirror);

    if (mirror) {
      return mirror;
    }

    return packageMirrors.get("default"); // MacOS packages are only available from default
  }
}
