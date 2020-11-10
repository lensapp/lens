import path from "path"
import fse from "fs-extra"
import execa from "execa"
import { Writable } from "stream"

function firstLongest(a: string, b: string) {
  if (a.length >= b.length) {
    return a
  }

  return b
}

function makeSink(prefix: string) {
  let buf = ""

  return new Writable({
    write(chunk: any, encoding: string, cb: () => void) {
      buf += chunk

      const parts = buf.split(/\r?\n/)
      const endsWithNL = buf.endsWith("\n")
      if (endsWithNL) {
        buf = parts.pop()
      } else {
        buf = ""
      }

      for (const line of parts) {
        console.log(`${prefix}${line}`)
      }

      cb()
    }
  })
}

const args = process.argv.slice(2) // remove node call and file name call

async function buildInTreeExtension(extensionPath: string, prefix: string) {
  console.log(`Building: ${extensionPath}`)

  const install = execa("yarn", { cwd: extensionPath })
  install.stdout.pipe(makeSink(prefix))
  await install

  const build = execa("yarn", ["run", "build"], { cwd: extensionPath })
  build.stdout.pipe(makeSink(prefix))
  await build
}

async function testInTreeExtension(extensionPath: string, prefix: string) {
  console.log(`Testing: ${extensionPath}`)

  const test = execa("yarn", ["test"], { cwd: extensionPath })
  test.stdout.pipe(makeSink(prefix))
  await test
}

async function main() {
  const cwd = process.cwd()
  const [extensionsFolder, action] = args
  const pathToRootExtensions = path.resolve(path.join(cwd, extensionsFolder))

  const folders: string[] = []
  const names: string[] = []

  for (const entry of await fse.readdir(pathToRootExtensions)) {
    const entryPath = path.resolve(pathToRootExtensions, entry)
    const info = await fse.stat(entryPath)
    if (!info.isDirectory()) {
      continue
    }

    folders.push(entryPath)
    names.push(entry)
  }

  const longestName = names.reduce(firstLongest, "")
  const prefixWidth = longestName.length + 1
  const prefixes = names.map(name => `${name}:${" ".repeat(prefixWidth - name.length)}`)

  switch (action.toLowerCase()) {
    case "build":
      await Promise.all(folders.map((folder, i) => buildInTreeExtension(folder, prefixes[i])))
      break
    case "test":
      await Promise.all(folders.map((folder, i) => testInTreeExtension(folder, prefixes[i])))
      break
  }

}

main().catch(console.error)
