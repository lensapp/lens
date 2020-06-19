import * as request from "request"
import * as fs from "fs"
import { ensureDir, pathExists } from "fs-extra"
import * as md5File from "md5-file"
import * as requestPromise from "request-promise-native"
import * as path from "path"

class KubectlDownloader {
  public kubectlVersion: string
  protected url: string
  protected path: string;
  protected pathEtag: string;
  protected etag: string;
  protected dirname: string

  constructor(clusterVersion: string, platform: string, arch: string, target: string) {
    this.kubectlVersion = clusterVersion;
    const binaryName = platform === "windows" ? "kubectl.exe" : "kubectl"
    this.url = `https://storage.googleapis.com/kubernetes-release/release/v${this.kubectlVersion}/bin/${platform}/${arch}/${binaryName}`;
    this.dirname = path.dirname(target);
    this.path = target;
    this.pathEtag = target + ".etag";
    this.etag = "";
  }

  protected async urlEtag() {
    if (this.etag === "") {
      const response = await requestPromise({
        method: "HEAD",
        uri: this.url,
        resolveWithFullResponse: true
      }).catch((error) => { console.log(error) })

      if (response.headers["etag"]) {
        this.etag = response.headers["etag"].replace(/"/g, "")
      }
    }
    return this.etag
  }

  public async checkBinary() {
    const exists = await pathExists(this.path)
    if (exists) {
      let oldEtag = ""
      try {
        oldEtag = await fs.promises.readFile(this.pathEtag, "utf8")
      }
      catch(err) {
        // treat any error here as a bad check
        console.log(`Error reading saved etag for local kubectl (${err.message})`)
        return false
      }
      const etag = await this.urlEtag()
      if(oldEtag == etag) {
        console.log("Local kubectl etag matches the remote etag")
        return true
      }

      console.log(`Local kubectl etag ${oldEtag} does not match the remote etag ${etag}, unlinking`)
      await fs.promises.unlink(this.path)
      await fs.promises.unlink(this.pathEtag)
    }

    return false
  }

  public async downloadKubectl() {
    const exists = await this.checkBinary();
    if(exists) {
      console.log("Already exists and is valid")
      return new Promise((resolve, reject) => resolve(false))
    }
    await ensureDir(this.dirname, 0o755)

    try {
      const etag = await this.urlEtag()
      await fs.promises.writeFile(this.pathEtag, etag, 'utf8')
    }
    catch(err) {
      console.log(`error (${err.message}) saving kubectl etag, this may incur further downloads`)
    }
    const file = fs.createWriteStream(this.path)
    console.log(`Downloading kubectl ${this.kubectlVersion} from ${this.url} to ${this.path}`)
    const requestOpts: request.UriOptions & request.CoreOptions = {
      uri: this.url,
      gzip: true
    }
    const stream = request(requestOpts)

    stream.on("complete", () => {
      console.log("kubectl binary download finished")
      file.end(() => {})
    })

    stream.on("error", (error) => {
      console.log(error)
      fs.unlink(this.path, () => {})
      throw(error)
    })
    return new Promise((resolve, reject) => {
      file.on("close", () => {
        console.log("kubectl binary download closed")
        fs.chmod(this.path, 0o755, () => {})
        resolve(true)
      })
      stream.pipe(file)
    })
  }
}

const downloadVersion: string = require("../package.json").config.bundledKubectlVersion
const baseDir = path.join(process.env.INIT_CWD, 'binaries', 'client')
const downloads = [
  { platform: 'linux', arch: 'amd64', target: path.join(baseDir, 'linux', 'x64', 'kubectl') },
  { platform: 'darwin', arch: 'amd64', target: path.join(baseDir, 'darwin', 'x64', 'kubectl') },
  { platform: 'windows', arch: 'amd64', target: path.join(baseDir, 'windows', 'x64', 'kubectl.exe') },
  { platform: 'windows', arch: '386', target: path.join(baseDir, 'windows', 'ia32', 'kubectl.exe') }
]

downloads.forEach((dlOpts) => {
  console.log(dlOpts)
  const downloader = new KubectlDownloader(downloadVersion, dlOpts.platform, dlOpts.arch, dlOpts.target);
  console.log("Downloading: " + JSON.stringify(dlOpts));
  let checkBinary = async (downloaded: boolean) => {
    if (downloaded) {
      await downloader.checkBinary()
    }
  }
  downloader.downloadKubectl().then((downloaded: boolean) => checkBinary(downloaded).then(() => console.log("Download complete")))
})

