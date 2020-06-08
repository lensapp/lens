import { Application } from "spectron"
import * as util from "../helpers/utils"

describe("app start", () => {
  let app: Application
  beforeEach(async () => {
    app = util.setup()
    await app.start()
    const windowCount = await app.client.getWindowCount()
    await app.client.windowByIndex(windowCount - 1)
    await app.client.waitUntilWindowLoaded()
  }, 20000)

  it('starts with whats new flow', async () => {
    await app.client.waitUntilTextExists("h1", "What's new")
    await app.client.click("button.btn-primary")
    await app.client.waitUntilTextExists("h1", "Welcome")
  })

  afterEach(async () => {
    if (app && app.isRunning()) {
      return util.tearDown(app)
    }
  })
})
