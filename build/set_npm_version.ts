import * as fs from "fs"
import * as path from "path"
import packageInfo from "../src/extensions/npm/extensions/package.json"
import appInfo from "../package.json"

const packagePath = path.join(__dirname, "../src/extensions/npm/extensions/package.json")

packageInfo.version = appInfo.version
fs.writeFileSync(packagePath, JSON.stringify(packageInfo, null, 2) + "\n")
