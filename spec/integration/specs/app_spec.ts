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

  const addMinikubeCluster = async (app: Application) => {
    await app.client.click("a#add-cluster")
    await app.client.waitUntilTextExists("legend", "Choose config:")
    await app.client.selectByVisibleText("select#kubecontext-select", "minikube (new)")
    await app.client.click("button.btn-primary")
  }

  const waitForWebview = async (app: Application) => {
    let windowCount = await app.client.getWindowCount()
    // wait for webview to appear on window count
    while (windowCount == 1) {
      windowCount = await app.client.getWindowCount()
    }
    await app.client.windowByIndex(windowCount - 1)
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
    await addMinikubeCluster(app)
    await app.client.waitUntilTextExists("pre.auth-output", "Authentication proxy started")
    await waitForWebview(app)
    await app.client.waitUntilTextExists("span.link-text", "Cluster")
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
    await app.client.waitUntilTextExists("pre.auth-output", "Authentication proxy started")
    await waitForWebview(app)

    await app.client.waitUntilTextExists("span.link-text", "Cluster")
    await app.client.click(".sidebar-nav #workloads span.link-text")
    await app.client.waitUntilTextExists('a[href="/pods"]', "Pods")
    await app.client.click('a[href="/pods"]')
    await app.client.waitUntilTextExists("div.TableCell", "kube-apiserver-minikube")
    await app.client.click('.Icon.new-dock-tab')
    await app.client.waitUntilTextExists("li.MenuItem.create-resource-tab", "Create resource")
    await app.client.click("li.MenuItem.create-resource-tab")
    await app.client.waitForVisible(".CreateResource div.ace_content")
    // Write deployment manifest to editor
    await app.client.keys("apiVersion: apps/v1\n")
    await app.client.keys("kind: Deployment\n")
    await app.client.keys("metadata:\n")
    await app.client.keys("  name: nginx-deployment\n")
    await app.client.keys("\uE003spec:\n")
    await app.client.keys("  selector:\n")
    await app.client.keys("  matchLabels:\n")
    await app.client.keys("  app: nginx\n")
    await app.client.keys("\uE003\uE003template:\n")
    await app.client.keys("  metadata:\n")
    await app.client.keys("  labels:\n")
    await app.client.keys("  app: nginx\n")
    await app.client.keys("\uE003\uE003spec:\n")
    await app.client.keys("  containers:\n")
    await app.client.keys("- name: nginx\n")
    await app.client.keys("  image: nginx:alpine\n")
    // Create deployent
    await app.client.waitForEnabled("button.Button=Create & Close")
    await app.client.click("button.Button=Create & Close")
    // Wait until first bits of pod appears on dashboard
    await app.client.waitForExist(".name*=nginx-deployment-")
  })

  afterEach(async () => {
    if (app && app.isRunning()) {
      return util.tearDown(app)
    }
  })
})
