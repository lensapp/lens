import { Application } from "spectron"
import * as util from "../helpers/utils"
import { spawnSync } from "child_process"
import { stat } from "fs"

jest.setTimeout(20000)

describe("app start", () => {
  let app: Application
  const clickWhatsNew = async (app: Application) => {
    await app.client.waitUntilTextExists("h1", "What's new")
    await app.client.click("button.btn-primary")
    await app.client.waitUntilTextExists("h1", "Welcome")
  }

  beforeEach(async () => {
    app = util.setup()
    await app.start()
    const windowCount = await app.client.getWindowCount()
    await app.client.windowByIndex(windowCount - 1)
    await app.client.waitUntilWindowLoaded()
  }, 20000)

  it('shows "whats new"', async () => {
    await clickWhatsNew(app)
  })

  it('allows to add a cluster', async () => {
    const status = spawnSync("minikube status", {shell: true})
    if (status.status !== 0) {
      console.warn("minikube not running, skipping test")
      return
    }
    await clickWhatsNew(app)
    await app.client.click("a#add-cluster")
    await app.client.waitUntilTextExists("legend", "Choose config:")
    await app.client.selectByVisibleText("select#kubecontext-select", "minikube (new)")
    await app.client.click("button.btn-primary")
    await app.client.waitUntilTextExists("pre.auth-output", "Authentication proxy started")
    let windowCount = await app.client.getWindowCount()
    // wait for webview to appear on window count
    while (windowCount == 1) {
      windowCount = await app.client.getWindowCount()
    }
    await app.client.windowByIndex(windowCount - 1)
    await app.client.waitUntilTextExists("span.link-text", "Cluster")
    await app.client.click('a[href="/nodes"]')
    await app.client.waitUntilTextExists("div.TableCell", "minikube")
  })

  afterEach(async () => {
    if (app && app.isRunning()) {
      return util.tearDown(app)
    }
  })
})
