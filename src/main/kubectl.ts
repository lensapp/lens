import { app, remote } from "electron"
import path from "path"
import fs from "fs"
import { promiseExec } from "./promise-exec"
import logger from "./logger"
import { ensureDir, pathExists } from "fs-extra"
import * as lockFile from "proper-lockfile"
import { helmCli } from "./helm/helm-cli"
import { userStore } from "../common/user-store"
import { customRequest } from "../common/request";
import { getBundledKubectlVersion } from "../common/utils/app-version"
import { isDevelopment, isWindows } from "../common/vars";

// kubectlMap maps the "Major.Minor" version of kubernetes to a 
// "Major.Minor.Patch" version of kubectl
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
  ["1.16", "1.16.8"],
  ["1.17", getBundledKubectlVersion()],
  ["1.18", "1.18.0"]
])

const packageMirrors: Map<string, string> = new Map([
  ["default", "https://storage.googleapis.com/kubernetes-release/release"],
  ["china", "https://mirror.azure.cn/kubernetes/kubectl"]
])

const initScriptVersionString = "# lens-initscript v3";
const binaryName = isWindows ? "kubectl.exe" : "kubectl";
const platformName = isWindows ? "windows" : process.platform;
const normalizedArch = normalizeArch();
const bashInitScriptFileName = ".bash_set_path";
const zshInitScriptFileName = ".zlogin";

function normalizeArch() {
  if (process.arch == "x64") {
    return "amd64";
  }

  if (["x86", "ia32"].includes(process.arch)) {
    return "386";
  }

  return process.arch;
}

function renderBundledPath() {
  const pathParts = [];

  if (isDevelopment) {
    pathParts.push(process.cwd(), "binaries", "client", process.platform);
  } else {
    pathParts.push(process.resourcesPath);
  }

  pathParts.push(process.arch, binaryName);

  return path.join(...pathParts);
}

async function scriptIsLatest(scriptPath: string) {
  if (!await pathExists(scriptPath)) {
    return false
  }

  try {
    const filehandle = await fs.promises.open(scriptPath, 'r')
    const buffer = Buffer.alloc(40)
    await filehandle.read(buffer, 0, 40, 0)
    await filehandle.close()
    return buffer.toString().startsWith(initScriptVersionString)
  } catch (err) {
    logger.error(err)
    return false
  }
}

async function ensureLatestBashInitScript(helmPath: string, dirname: string) {
  const bashScriptPath = path.join(dirname, bashInitScriptFileName)
  if (await scriptIsLatest(bashScriptPath)) {
    return;
  }

  const bashScript =
    `${initScriptVersionString}
tempkubeconfig="$KUBECONFIG"
test -f "/etc/profile" && . "/etc/profile"
if test -f "$HOME/.bash_profile"; then
  . "$HOME/.bash_profile"
elif test -f "$HOME/.bash_login"; then
  . "$HOME/.bash_login"
elif test -f "$HOME/.profile"; then
  . "$HOME/.profile"
fi
export PATH="${this.dirname}:${helmPath}:$PATH"
export KUBECONFIG="$tempkubeconfig"
unset tempkubeconfig
`;

  return fs.promises.writeFile(bashScriptPath, bashScript, { mode: 0o644 })
}

async function ensureLatestZshInitScript(helmPath: string, dirname: string) {
  const zshScriptPath = path.join(dirname, zshInitScriptFileName)
  if (await scriptIsLatest(zshScriptPath)) {
    return;
  }

  const zshScript =
    `${initScriptVersionString}
tempkubeconfig=\"$KUBECONFIG\"

# restore previous ZDOTDIR
export ZDOTDIR="$OLD_ZDOTDIR"

# source all the files
"test -f "$OLD_ZDOTDIR/.zshenv" && . "$OLD_ZDOTDIR/.zshenv"
test -f "$OLD_ZDOTDIR/.zprofile" && . "$OLD_ZDOTDIR/.zprofile"
test -f "$OLD_ZDOTDIR/.zlogin" && . "$OLD_ZDOTDIR/.zlogin"
test -f "$OLD_ZDOTDIR/.zshrc" && . "$OLD_ZDOTDIR/.zshrc"

# voodoo to replace any previous occurences of kubectl path in the PATH
kubectlpath="${this.dirname}"
helmpath="${helmPath}"
p=":$kubectlpath:"
d=":$PATH:"
d=\${d//$p/:}
d=\${ d /#: /}
export PATH="$kubectlpath:$helmpath:\${d/%:/}"
export KUBECONFIG ="$tempkubeconfig"
unset tempkubeconfig
unset OLD_ZDOTDIR
`;

  return fs.promises.writeFile(zshScriptPath, zshScript, { mode: 0o644 })
}

function getDownloadMirror() {
  // MacOS packages are only available from default
  return packageMirrors.get(userStore.preferences.downloadMirror)
    || packageMirrors.get("default");
}

interface ClientOnlyKubeVersion {
  clientVersion: {
    major: string;
    minor: string;
    gitVersion: string;
    gitCommit: string;
    gitTreeState: string;
    buildDate: string;
    goVersion: string;
    compiler: string;
    platform: string;
  }
}

export class Kubectl {
  private _kubectlVersion: string
  public get kubectlVersion() {
    return userStore.preferences.alwaysUseBundledKubectl
      ? getBundledKubectlVersion()
      : this._kubectlVersion
  }

  public readonly url: string
  public readonly path: string
  public get dirname() {
    return path.dirname(this.path);
  }

  public static readonly defaultDirectory = path.join((app || remote.app).getPath("userData"), "binaries", "kubectl")
  public static readonly bundled: Kubectl = Object.create(Kubectl.prototype, {
    kubectlVersion: { value: getBundledKubectlVersion() },
    url: { value: `${getDownloadMirror()}/v${getBundledKubectlVersion()}/bin/${platformName}/${normalizedArch}/${binaryName}` },
    path: { value: renderBundledPath() },
  });

  constructor(clusterVersion: string) {
    const versionParts = /^v?(\d+\.\d+)(.*)/.exec(clusterVersion)
    const majorMinorVersion = versionParts[1]
    const versionLocation = kubectlMap.has(majorMinorVersion) ? "version map" : "fallback";

    // if kubectlMap has the "Major.Minor" kube version, use the associated semver kubectl version
    // otherwise use the exact version given.
    this._kubectlVersion = kubectlMap.get(majorMinorVersion) || (versionParts[1] + versionParts[2]);
    logger.debug(`Set kubectl version ${this._kubectlVersion} for cluster version ${clusterVersion} using ${versionLocation}`)

    this.url = `${getDownloadMirror()}/v${this._kubectlVersion}/bin/${platformName}/${normalizedArch}/${binaryName}`
    this.path = path.normalize(path.join(Kubectl.defaultDirectory, this._kubectlVersion, binaryName))
  }

  public async getPath(): Promise<string> {
    try {
      await this.ensureKubectl()
      return this.path
    } catch (err) {
      logger.error("Failed to ensure kubectl, fallback to the bundled version")
      logger.error(err)
      return Kubectl.bundled.path
    }
  }

  public async binDir() {
    return path.dirname(await this.getPath());
  }

  private async binaryIsCorrectVersion() {
    if (!await pathExists(this.path)) {
      return false;
    }

    try {
      const { stdout } = await promiseExec(`"${this.path}" version --client=true -o json`)
      const output: ClientOnlyKubeVersion = JSON.parse(stdout)
      const version = /^v?(.+)/g.exec(output.clientVersion.gitVersion)[1];

      if (version === this.kubectlVersion) {
        logger.debug(`Local kubectl is version ${this.kubectlVersion}`)
        return true
      }

      logger.error(`Local kubectl is version ${version}, expected ${this.kubectlVersion}, unlinking`)
    } catch (err) {
      logger.error(`Local kubectl failed to run properly (${err.message}), unlinking`)
    }

    await fs.promises.unlink(this.path)
    return false
  }

  private async binaryIsBundled(): Promise<boolean> {
    if (this.kubectlVersion !== Kubectl.bundled.kubectlVersion) {
      return false;
    }

    try {
      if (!await pathExists(this.path)) {
        await fs.promises.copyFile(Kubectl.bundled.path, this.path)
        await fs.promises.chmod(this.path, 0o755)
      }

      return true
    } catch (err) {
      logger.error(`Could not copy the bundled kubectl to app-data: ${err}`)
      return false
    }
  }

  public async ensureKubectl(): Promise<boolean> {
    await ensureDir(this.dirname, 0o755)

    try {
      const release = await lockFile.lock(this.dirname);
      logger.debug(`Acquired a lock for ${this.kubectlVersion}`)

      if (!await this.binaryIsBundled()
        && !await this.binaryIsCorrectVersion()) {
        try {
          await this.downloadKubectl();
        } catch (err) {
          logger.error("Failed to write init scripts");
          logger.error(err);
        }
      }

      try {
        await this.ensureLatestInitScripts();
      } catch (err) {
        logger.error("Failed to write init scripts");
        logger.error(err)
      }

      logger.debug(`Releasing lock for ${this.kubectlVersion}`)
      await release()

      return true
    } catch (e) {
      logger.error(`Failed to get a lock for ${this.kubectlVersion}`)
      logger.error(e)
      return false;
    }
  }

  public async downloadKubectl() {
    await ensureDir(path.dirname(this.path), 0o755)

    logger.info(`Downloading kubectl ${this.kubectlVersion} from ${this.url} to ${this.path}`)
    return new Promise((resolve, reject) => {
      const stream = customRequest({
        url: this.url,
        gzip: true,
      });
      const file = fs.createWriteStream(this.path)
      stream.on("complete", () => {
        logger.debug("kubectl binary download finished")
        file.end()
      })
      stream.on("error", (error) => {
        logger.error(error)
        fs.unlink(this.path, () => {
          // do nothing
        })
        reject(error)
      })
      file.on("close", () => {
        logger.debug("kubectl binary download closed")
        fs.chmod(this.path, 0o755, (err) => {
          if (err) reject(err);
        })
        resolve()
      })
      stream.pipe(file)
    })
  }

  protected async ensureLatestInitScripts() {
    const helmPath = helmCli.getBinaryDir()
    const dirname = this.dirname;

    return Promise.all([
      ensureLatestBashInitScript(helmPath, dirname),
      ensureLatestZshInitScript(helmPath, dirname),
    ]);
  }
}
