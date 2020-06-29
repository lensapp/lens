import { Application } from "spectron"
import * as util from "../helpers/utils"
import { spawnSync } from "child_process"
import { stat } from "fs"

jest.setTimeout(20000)

const BACKSPACE = "\uE003"

describe("app start", () => {
  let app: Application
  const clickWhatsNew = async (app: Application) => {
    await app.client.waitUntilTextExists("h1", "What's new")
    await app.client.click("button.btn-primary")
    await app.client.waitUntilTextExists("h1", "Welcome")
  }

  const addMinikubeCluster = async (app: Application) => {
    await app.client.click("a#add-cluster")
    await app.client.waitUntilTextExists("legend", "Choose config:")
    await app.client.selectByVisibleText("select#kubecontext-select", "minikube (new)")
    await app.client.click("button.btn-primary")
  }

  const waitForMinikubeDashboard = async (app: Application) => {
    await app.client.waitUntilTextExists("pre.auth-output", "Authentication proxy started")
    let windowCount = await app.client.getWindowCount()
    // wait for webview to appear on window count
    while (windowCount == 1) {
      windowCount = await app.client.getWindowCount()
    }
    await app.client.windowByIndex(windowCount - 1)
    await app.client.waitUntilTextExists("span.link-text", "Cluster")
  }

  beforeEach(async () => {
    app = util.setup()
    await app.start()
    await app.client.waitUntilWindowLoaded()
    let windowCount = await app.client.getWindowCount()
    while (windowCount > 1) {
      windowCount = await app.client.getWindowCount()
    }
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
    await addMinikubeCluster(app)
    await waitForMinikubeDashboard(app)
    await app.client.click('a[href="/nodes"]')
    await app.client.waitUntilTextExists("div.TableCell", "minikube")
  })

  it('allows to create a pod', async () => {
    const status = spawnSync("minikube status", {shell: true})
    if (status.status !== 0) {
      console.warn("minikube not running, skipping test")
      return
    }
    await clickWhatsNew(app)
    await addMinikubeCluster(app)
    await waitForMinikubeDashboard(app)
    await app.client.click(".sidebar-nav #workloads span.link-text")
    await app.client.waitUntilTextExists('a[href="/pods"]', "Pods")
    await app.client.click('a[href="/pods"]')
    await app.client.waitUntilTextExists("div.TableCell", "kube-apiserver-minikube")
    await app.client.click('.Icon.new-dock-tab')
    await app.client.waitUntilTextExists("li.MenuItem.create-resource-tab", "Create resource")
    await app.client.click("li.MenuItem.create-resource-tab")
    await app.client.waitForVisible(".CreateResource div.ace_content")
    // Write pod manifest to editor
    await app.client.keys("apiVersion: v1\n")
    await app.client.keys("kind: Pod\n")
    await app.client.keys("metadata:\n")
    await app.client.keys("  name: nginx\n")
    await app.client.keys(BACKSPACE + "spec:\n")
    await app.client.keys("  containers:\n")
    await app.client.keys("- name: nginx\n")
    await app.client.keys("  image: nginx:alpine\n")
    // Create deployent
    await app.client.waitForEnabled("button.Button=Create & Close")
    await app.client.click("button.Button=Create & Close")
    // Wait until first bits of pod appears on dashboard
    await app.client.waitForExist(".name=nginx")
    // Open pod details
    await app.client.click(".name=nginx")
    await app.client.waitUntilTextExists("div.drawer-title-text", "Pod: nginx")
  })

  afterEach(async () => {
    if (app && app.isRunning()) {
      return util.tearDown(app)
    }
  })
})
