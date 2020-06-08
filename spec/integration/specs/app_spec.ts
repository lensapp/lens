import { Application } from "spectron"
import * as util from "../helpers/utils"

describe("app start", () => {
  let app: Application
  beforeEach(() => {
    app = util.setup()
    return app.start()
  }, 20000)

  it('starts with whats new flow', async () => {
    await app.client.windowByIndex(1)
    await app.client.waitUntilWindowLoaded()
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
